import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { createRemoteJWKSet, jwtVerify } from "https://esm.sh/jose@5.10.0";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

function requiredEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

async function verifyFirebaseToken(req: Request) {
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) throw new Error("Missing Firebase token");

  const projectId = requiredEnv("FIREBASE_PROJECT_ID");
  const jwks = createRemoteJWKSet(new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"));
  const { payload } = await jwtVerify(token, jwks, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
  });

  const uid = payload.sub;
  const email = typeof payload.email === "string" ? payload.email.toLowerCase() : null;
  if (!uid) throw new Error("Invalid Firebase token");
  return { uid, email };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return jsonResponse({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const url = new URL(req.url);
    const view = url.searchParams.get("view") ?? "full";
    const identity = await verifyFirebaseToken(req);
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: workspace, error: workspaceError } = await supabase
      .from("workspaces")
      .select(`
        id,
        name,
        plan,
        beta_status,
        billing_status,
        paddle_customer_id,
        paddle_subscription_id,
        paddle_price_id,
        paddle_transaction_id,
        current_period_starts_at,
        current_period_ends_at,
        trial_ends_at,
        canceled_at,
        lead_magnet_limit,
        monthly_lead_limit,
        monthly_email_limit,
        file_size_limit
      `)
      .eq("owner_external_id", identity.uid)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (workspaceError) throw workspaceError;

    if (!workspace?.id) {
      return jsonResponse({ ok: true, workspace: null, magnets: [], leads: [] });
    }

    const magnetSelect = view === "leads"
      ? "id,status"
      : `
        id,
        title,
        slug,
        description,
        status,
        resource_type,
        resource_url,
        file_name,
        file_size,
        cta_label,
        accent_color,
        background_preset,
        layout,
        page_config,
        delivery_email_enabled,
        delivery_email_subject,
        delivery_email_body,
        visits_count,
        leads_count,
        last_lead_at,
        created_at,
        updated_at,
        published_at
      `;

    const { data: magnets, error: magnetsError } = await supabase
      .from("lead_magnets")
      .select(magnetSelect)
      .eq("workspace_id", workspace.id)
      .order("created_at", { ascending: false });

    if (magnetsError) throw magnetsError;

    const weeklyVisitsByMagnet = new Map<string, number>();
    if (view !== "leads") {
      const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data: recentVisits, error: visitsError } = await supabase
        .from("lead_magnet_visits")
        .select("lead_magnet_id")
        .eq("workspace_id", workspace.id)
        .gte("created_at", weekStart);

      if (visitsError) throw visitsError;

      for (const visit of recentVisits ?? []) {
        const magnetId = visit.lead_magnet_id as string;
        weeklyVisitsByMagnet.set(magnetId, (weeklyVisitsByMagnet.get(magnetId) ?? 0) + 1);
      }
    }

    const shapedMagnets = ((magnets ?? []) as unknown as Array<Record<string, unknown> & { id: string }>).map((magnet) => ({
        ...magnet,
        weekly_visits_count: weeklyVisitsByMagnet.get(magnet.id) ?? 0,
      }));

    if (view === "dashboard") {
      return jsonResponse({
        ok: true,
        workspace,
        magnets: shapedMagnets,
        leads: [],
      });
    }

    const { data: leads, error: leadsError } = await supabase
      .from("leads")
      .select(`
        id,
        email,
        source,
        referrer,
        metadata,
        delivered_at,
        created_at,
        lead_magnet_id,
        lead_magnets (
          id,
          title,
          slug
        )
      `)
      .eq("workspace_id", workspace.id)
      .order("created_at", { ascending: false })
      .limit(1000);

    if (leadsError) throw leadsError;

    return jsonResponse({
      ok: true,
      workspace,
      magnets: shapedMagnets,
      leads: leads ?? [],
    });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 401 },
    );
  }
});
