import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

type CaptureBody = {
  slug?: string;
  email?: string;
  source?: string;
  referrer?: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function deliverySubject(title: string, custom?: string | null) {
  return custom?.trim() || `Your copy of ${title}`;
}

function deliveryHtml(title: string, description: string, accessUrl: string) {
  return `
    <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:40px 20px;color:#0f172a">
      <p style="font-size:13px;color:#64748b;margin:0 0 18px">Your resource is ready.</p>
      <h1 style="font-size:24px;line-height:1.2;margin:0 0 12px">${title}</h1>
      ${description ? `<p style="font-size:15px;line-height:1.6;color:#475569;margin:0 0 28px">${description}</p>` : ""}
      <a href="${accessUrl}" style="display:inline-block;background:#0A8CFF;color:#fff;text-decoration:none;padding:13px 18px;border-radius:12px;font-weight:600">Open resource</a>
      <p style="font-size:12px;color:#94a3b8;margin:28px 0 0">You received this because you requested this resource.</p>
    </div>
  `;
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
    }, { onConflict: "lead_magnet_id,email" })
    .select()
    .single();

  if (leadError) {
    return jsonResponse({ error: leadError.message }, { status: 500 });
  }

  await supabase.rpc("increment_lead_magnet_leads", { magnet_id: magnet.id });

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

  if (magnet.delivery_email_enabled && resendApiKey && fromEmail && accessUrl) {
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
        html: deliveryHtml(magnet.title, magnet.description ?? "", accessUrl),
      }),
    });

    if (response.ok) {
      await supabase
        .from("delivery_events")
        .update({ status: "sent", sent_at: new Date().toISOString() })
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

  await supabase.from("agent_events").insert({
    workspace_id: magnet.workspace_id,
    kind: "lead.captured",
    subject_type: "lead",
    subject_id: lead.id,
    summary: `Lead captured for ${magnet.title}`,
    payload: { lead_magnet_id: magnet.id, email },
  });

  return jsonResponse({
    ok: true,
    accessUrl,
    title: magnet.title,
    deliveryEmailEnabled: magnet.delivery_email_enabled,
  });
});
