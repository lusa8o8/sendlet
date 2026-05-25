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

function adminEmails() {
  return (Deno.env.get("SENDLET_ADMIN_EMAILS") ?? "lusamalungisha@gmail.com")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
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
    if (!identity.email || !adminEmails().includes(identity.email)) {
      return jsonResponse({ error: "Forbidden" }, { status: 403 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const [workspacesResult, billingEventsResult, failedDeliveriesResult] = await Promise.all([
      supabase
        .from("workspaces")
        .select(`
          id,
          name,
          owner_email,
          plan,
          beta_status,
          billing_status,
          paddle_customer_id,
          paddle_subscription_id,
          paddle_price_id,
          lead_magnet_limit,
          monthly_lead_limit,
          monthly_email_limit,
          file_size_limit,
          current_period_ends_at,
          created_at
        `)
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("billing_events")
        .select(`
          id,
          workspace_id,
          paddle_event_id,
          event_type,
          paddle_customer_id,
          paddle_subscription_id,
          paddle_price_id,
          processed_at,
          error_message,
          created_at
        `)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("delivery_events")
        .select("id,status,to_email,subject,error_message,metadata,created_at")
        .eq("status", "failed")
        .order("created_at", { ascending: false })
        .limit(25),
    ]);

    if (workspacesResult.error) throw workspacesResult.error;
    if (billingEventsResult.error) throw billingEventsResult.error;
    if (failedDeliveriesResult.error) throw failedDeliveriesResult.error;

    return jsonResponse({
      ok: true,
      workspaces: workspacesResult.data ?? [],
      billingEvents: billingEventsResult.data ?? [],
      failedDeliveries: failedDeliveriesResult.data ?? [],
    });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Unexpected admin-data error" },
      { status: 401 },
    );
  }
});
