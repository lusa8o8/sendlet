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

  return {
    uid,
    email: typeof payload.email === "string" ? payload.email : null,
  };
}

function validateWebhookUrl(value: string) {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:") {
      return "Use an HTTPS webhook URL.";
    }
    return null;
  } catch {
    return "Enter a valid webhook URL.";
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (!["GET", "PUT", "DELETE"].includes(req.method)) {
    return jsonResponse({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const identity = await verifyFirebaseToken(req);
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: existingWorkspace, error: workspaceReadError } = await supabase
      .from("workspaces")
      .select("id")
      .eq("owner_external_id", identity.uid)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (workspaceReadError) throw workspaceReadError;

    if (!existingWorkspace && req.method === "GET") {
      return jsonResponse({ ok: true, webhook: null });
    }

    let workspaceId = existingWorkspace?.id as string | undefined;

    if (!workspaceId) {
      const { data: workspace, error } = await supabase
        .from("workspaces")
        .insert({
          name: identity.email ? `${identity.email}'s workspace` : "Sendlet workspace",
          owner_external_id: identity.uid,
          owner_email: identity.email,
        })
        .select("id")
        .single();
      if (error) throw error;
      workspaceId = workspace.id;
    }

    if (req.method === "GET") {
      const { data, error } = await supabase
        .from("lead_webhooks")
        .select("id,url,enabled,last_status,last_error,last_sent_at,updated_at")
        .eq("workspace_id", workspaceId)
        .maybeSingle();
      if (error) throw error;
      return jsonResponse({ ok: true, webhook: data ?? null });
    }

    if (req.method === "DELETE") {
      const { error } = await supabase
        .from("lead_webhooks")
        .delete()
        .eq("workspace_id", workspaceId);
      if (error) throw error;
      return jsonResponse({ ok: true, webhook: null });
    }

    const body = (await req.json().catch(() => ({}))) as { url?: string; enabled?: boolean };
    const url = body.url?.trim() ?? "";
    const validationError = validateWebhookUrl(url);
    if (validationError) {
      return jsonResponse({ error: validationError }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("lead_webhooks")
      .upsert({
        workspace_id: workspaceId,
        url,
        enabled: body.enabled ?? true,
        last_error: null,
      }, { onConflict: "workspace_id" })
      .select("id,url,enabled,last_status,last_error,last_sent_at,updated_at")
      .single();

    if (error) throw error;
    return jsonResponse({ ok: true, webhook: data });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 401 },
    );
  }
});
