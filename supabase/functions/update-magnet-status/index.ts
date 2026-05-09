import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { createRemoteJWKSet, jwtVerify } from "https://esm.sh/jose@5.10.0";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

type Status = "draft" | "published" | "paused";

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

  if (!payload.sub) throw new Error("Invalid Firebase token");
  return { uid: payload.sub };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const identity = await verifyFirebaseToken(req);
    const body = await req.json().catch(() => ({})) as { id?: string; status?: Status };

    if (!body.id || !body.status) {
      return jsonResponse({ error: "Missing id or status" }, { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data, error } = await supabase
      .from("lead_magnets")
      .update({
        status: body.status,
        published_at: body.status === "published" ? new Date().toISOString() : null,
      })
      .eq("id", body.id)
      .eq("owner_external_id", identity.uid)
      .select()
      .single();

    if (error) throw error;

    return jsonResponse({ ok: true, magnet: data });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 401 },
    );
  }
});
