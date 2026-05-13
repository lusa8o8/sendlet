import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

type CaptureBody = {
  slug?: string;
  email?: string;
  name?: string;
  source?: string;
  referrer?: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function monthStartIso() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

function betaLimitResponse(message: string, details?: Record<string, unknown>) {
  return jsonResponse(
    {
      error: message,
      code: "BETA_LIMIT_REACHED",
      upgradeUrl: "mailto:hello@sendlet.app?subject=Upgrade%20Sendlet%20beta%20access",
      ...details,
    },
    { status: 402 },
  );
}

function deliverySubject(title: string, custom?: string | null) {
  return custom?.trim() || `Your copy of ${title}`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function linkHtml(accessUrl: string) {
  return `<a href="${accessUrl}" style="display:inline-block;background:#0A8CFF;color:#fff;text-decoration:none;padding:13px 18px;border-radius:12px;font-weight:600">Open resource</a>`;
}

function footerHtml(unsubscribeUrl: string) {
  return `<p style="font-size:12px;color:#94a3b8;margin:28px 0 0">You received this because you requested this resource. <a href="${unsubscribeUrl}" style="color:#64748b">Unsubscribe</a></p>`;
}

function customDeliveryHtml(body: string, accessUrl: string, unsubscribeUrl: string) {
  const escapedLink = escapeHtml(accessUrl);
  const rendered = escapeHtml(body)
    .replaceAll("{{resource_link}}", linkHtml(accessUrl))
    .replaceAll("{{ resource_link }}", linkHtml(accessUrl))
    .replaceAll("{{resource_url}}", `<a href="${accessUrl}">${escapedLink}</a>`)
    .replaceAll("{{ resource_url }}", `<a href="${accessUrl}">${escapedLink}</a>`)
    .split("\n")
    .map((line) => line.trim() ? `<p style="font-size:15px;line-height:1.6;margin:0 0 14px">${line}</p>` : `<div style="height:8px"></div>`)
    .join("");

  const hasLinkToken = body.includes("{{resource_link}}")
    || body.includes("{{ resource_link }}")
    || body.includes("{{resource_url}}")
    || body.includes("{{ resource_url }}");

  return `
    <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:40px 20px;color:#0f172a">
      ${rendered}
      ${hasLinkToken ? "" : `<div style="margin-top:24px">${linkHtml(accessUrl)}</div>`}
      ${footerHtml(unsubscribeUrl)}
    </div>
  `;
}

function deliveryHtml(title: string, description: string, accessUrl: string, unsubscribeUrl: string, customBody?: string | null) {
  if (customBody?.trim()) {
    return customDeliveryHtml(customBody.trim(), accessUrl, unsubscribeUrl);
  }

  return `
    <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:40px 20px;color:#0f172a">
      <p style="font-size:13px;color:#64748b;margin:0 0 18px">Your resource is ready.</p>
      <h1 style="font-size:24px;line-height:1.2;margin:0 0 12px">${escapeHtml(title)}</h1>
      ${description ? `<p style="font-size:15px;line-height:1.6;color:#475569;margin:0 0 28px">${escapeHtml(description)}</p>` : ""}
      ${linkHtml(accessUrl)}
      ${footerHtml(unsubscribeUrl)}
    </div>
  `;
}

async function sendLeadWebhook({
  supabase,
  magnet,
  lead,
  name,
  accessUrl,
}: {
  supabase: ReturnType<typeof createClient>;
  magnet: Record<string, unknown>;
  lead: Record<string, unknown>;
  name: string | null;
  accessUrl: string | null;
}) {
  const { data: webhook } = await supabase
    .from("lead_webhooks")
    .select("id,url,enabled")
    .eq("workspace_id", magnet.workspace_id)
    .eq("enabled", true)
    .maybeSingle();

  if (!webhook?.url) return;

  const payload = {
    event: "lead.created",
    created_at: new Date().toISOString(),
    lead: {
      id: lead.id,
      email: lead.email,
      name,
      source: lead.source,
      referrer: lead.referrer,
      has_resource_url: !!accessUrl,
    },
    lead_magnet: {
      id: magnet.id,
      title: magnet.title,
      slug: magnet.slug,
      url: `${(Deno.env.get("SENDLET_APP_URL") ?? "https://sendlet.trymyapp.uk").replace(/\/$/, "")}/p/${magnet.slug}`,
    },
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const response = await fetch(webhook.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Sendlet-Webhooks/1.0",
        "X-Sendlet-Event": "lead.created",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    await supabase
      .from("lead_webhooks")
      .update({
        last_status: response.status,
        last_error: response.ok ? null : (await response.text()).slice(0, 500),
        last_sent_at: new Date().toISOString(),
      })
      .eq("id", webhook.id);
  } catch (error) {
    await supabase
      .from("lead_webhooks")
      .update({
        last_status: null,
        last_error: error instanceof Error ? error.message.slice(0, 500) : "Webhook request failed",
        last_sent_at: new Date().toISOString(),
      })
      .eq("id", webhook.id);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, { status: 405 });
  }

  const body = (await req.json().catch(() => ({}))) as CaptureBody;
  const slug = body.slug?.trim();
  const email = normalizeEmail(body.email ?? "");
  const name = body.name?.trim() || null;

  if (!slug || !email || !validEmail(email)) {
    return jsonResponse({ error: "Enter a valid email address." }, { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  const { data: magnet, error: magnetError } = await supabase
    .from("lead_magnets")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (magnetError) {
    return jsonResponse({ error: magnetError.message }, { status: 500 });
  }

  if (!magnet) {
    return jsonResponse({ error: "Resource not found" }, { status: 404 });
  }

  const { data: workspace, error: workspaceError } = await supabase
    .from("workspaces")
    .select("id,beta_status,monthly_lead_limit,monthly_email_limit")
    .eq("id", magnet.workspace_id)
    .maybeSingle();

  if (workspaceError) {
    return jsonResponse({ error: workspaceError.message }, { status: 500 });
  }

  if (workspace?.beta_status === "blocked" || workspace?.beta_status === "waitlist") {
    return betaLimitResponse("This resource is not accepting new leads right now.", {
      betaStatus: workspace.beta_status,
    });
  }

  const { data: existingLead } = await supabase
    .from("leads")
    .select("id")
    .eq("lead_magnet_id", magnet.id)
    .eq("email", email)
    .maybeSingle();

  const isNewLead = !existingLead?.id;
  const monthStart = monthStartIso();
  if (isNewLead) {
    const { count: monthlyLeadCount, error: monthlyLeadCountError } = await supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", magnet.workspace_id)
      .gte("created_at", monthStart);

    if (monthlyLeadCountError) {
      return jsonResponse({ error: monthlyLeadCountError.message }, { status: 500 });
    }

    const monthlyLeadLimit = workspace?.monthly_lead_limit ?? 250;
    if ((monthlyLeadCount ?? 0) >= monthlyLeadLimit) {
      return betaLimitResponse("This workspace has reached the beta lead limit for this month.", {
        limit: monthlyLeadLimit,
      });
    }
  }

  const userAgent = req.headers.get("user-agent") ?? "";
  const forwardedFor = req.headers.get("x-forwarded-for") ?? "";
  const ipHash = forwardedFor
    ? Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(forwardedFor))))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
    : null;

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .upsert({
      workspace_id: magnet.workspace_id,
      lead_magnet_id: magnet.id,
      email,
      source: body.source ?? null,
      referrer: body.referrer ?? null,
      user_agent: userAgent,
      ip_hash: ipHash,
      metadata: name ? { name } : {},
    }, { onConflict: "lead_magnet_id,email" })
    .select()
    .single();

  if (leadError) {
    return jsonResponse({ error: leadError.message }, { status: 500 });
  }

  if (isNewLead) {
    await supabase.rpc("increment_lead_magnet_leads", { magnet_id: magnet.id });
  }

  let accessUrl = magnet.resource_url as string | null;

  if (!accessUrl && magnet.resource_file_path) {
    const { data: signed } = await supabase.storage
      .from("lead-magnet-assets")
      .createSignedUrl(magnet.resource_file_path, 60 * 60 * 24 * 7);
    accessUrl = signed?.signedUrl ?? null;
  }

  const subject = deliverySubject(magnet.title, magnet.delivery_email_subject);
  const deliveryPayload = {
    workspace_id: magnet.workspace_id,
    lead_magnet_id: magnet.id,
    lead_id: lead.id,
    status: magnet.delivery_email_enabled ? "queued" : "skipped",
    to_email: email,
    subject,
    metadata: { access_url_present: !!accessUrl },
  };

  const { data: delivery } = await supabase
    .from("delivery_events")
    .insert(deliveryPayload)
    .select()
    .single();

  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const fromEmail = Deno.env.get("SENDLET_FROM_EMAIL");
  const appUrl = (Deno.env.get("SENDLET_APP_URL") ?? "https://sendlet.trymyapp.uk").replace(/\/$/, "");
  const unsubscribeUrl = `${appUrl}/unsubscribe?email=${encodeURIComponent(email)}&magnet=${encodeURIComponent(magnet.id)}`;

  const { data: unsubscribe } = await supabase
    .from("unsubscribes")
    .select("id")
    .eq("lead_magnet_id", magnet.id)
    .eq("email", email)
    .maybeSingle();

  let emailLimitReached = false;
  if (magnet.delivery_email_enabled && accessUrl) {
    const { count: monthlyEmailCount, error: monthlyEmailCountError } = await supabase
      .from("delivery_events")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", magnet.workspace_id)
      .eq("status", "sent")
      .gte("created_at", monthStart);

    if (monthlyEmailCountError) {
      return jsonResponse({ error: monthlyEmailCountError.message }, { status: 500 });
    }

    const monthlyEmailLimit = workspace?.monthly_email_limit ?? 250;
    emailLimitReached = (monthlyEmailCount ?? 0) >= monthlyEmailLimit;
  }

  if (unsubscribe?.id) {
    await supabase
      .from("delivery_events")
      .update({ status: "skipped", metadata: { access_url_present: !!accessUrl, skipped_reason: "unsubscribed" } })
      .eq("id", delivery?.id);
  } else if (emailLimitReached) {
    await supabase
      .from("delivery_events")
      .update({ status: "skipped", metadata: { access_url_present: !!accessUrl, skipped_reason: "beta_email_limit" } })
      .eq("id", delivery?.id);
  } else if (magnet.delivery_email_enabled && resendApiKey && fromEmail && accessUrl) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: email,
        subject,
        html: deliveryHtml(magnet.title, magnet.description ?? "", accessUrl, unsubscribeUrl, magnet.delivery_email_body),
      }),
    });

    if (response.ok) {
      const resendResult = await response.json().catch(() => ({}));
      await supabase
        .from("delivery_events")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
          metadata: {
            access_url_present: !!accessUrl,
            resend_id: typeof resendResult?.id === "string" ? resendResult.id : null,
          },
        })
        .eq("id", delivery?.id);
      await supabase
        .from("leads")
        .update({ delivered_at: new Date().toISOString() })
        .eq("id", lead.id);
    } else {
      const errorText = await response.text();
      await supabase
        .from("delivery_events")
        .update({ status: "failed", error_message: errorText.slice(0, 500) })
        .eq("id", delivery?.id);
    }
  }

  const { data: refreshedDelivery } = delivery?.id
    ? await supabase
        .from("delivery_events")
        .select("status,error_message")
        .eq("id", delivery.id)
        .maybeSingle()
    : { data: null };

  await supabase.from("agent_events").insert({
    workspace_id: magnet.workspace_id,
    kind: "lead.captured",
    subject_type: "lead",
    subject_id: lead.id,
    summary: `Lead captured for ${magnet.title}`,
    payload: { lead_magnet_id: magnet.id, email },
  });

  await sendLeadWebhook({ supabase, magnet, lead, name, accessUrl });

  return jsonResponse({
    ok: true,
    accessUrl,
    title: magnet.title,
    deliveryEmailEnabled: magnet.delivery_email_enabled,
    deliveryStatus: refreshedDelivery?.status ?? deliveryPayload.status,
    deliveryError: refreshedDelivery?.error_message ?? null,
    hasResource: !!accessUrl,
  });
});
