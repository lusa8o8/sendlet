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
  if (!uid) throw new Error("Invalid Firebase token");
  return { uid };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return jsonResponse({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const identity = await verifyFirebaseToken(req);
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: workspace, error: workspaceError } = await supabase
      .from("workspaces")
      .select("id,name")
      .eq("owner_external_id", identity.uid)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (workspaceError) throw workspaceError;

    if (!workspace?.id) {
      return jsonResponse({ ok: true, workspace: null, magnets: [], leads: [] });
    }

    const { data: magnets, error: magnetsError } = await supabase
      .from("lead_magnets")
      .select(`
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
      `)
      .eq("workspace_id", workspace.id)
      .order("created_at", { ascending: false });

    if (magnetsError) throw magnetsError;

    const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: recentVisits, error: visitsError } = await supabase
      .from("lead_magnet_visits")
      .select("lead_magnet_id")
      .eq("workspace_id", workspace.id)
      .gte("created_at", weekStart);

    if (visitsError) throw visitsError;

    const weeklyVisitsByMagnet = new Map<string, number>();
    for (const visit of recentVisits ?? []) {
      const magnetId = visit.lead_magnet_id as string;
      weeklyVisitsByMagnet.set(magnetId, (weeklyVisitsByMagnet.get(magnetId) ?? 0) + 1);
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
      magnets: (magnets ?? []).map((magnet) => ({
        ...magnet,
        weekly_visits_count: weeklyVisitsByMagnet.get(magnet.id) ?? 0,
      })),
      leads: leads ?? [],
    });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 401 },
    );
  }
});
