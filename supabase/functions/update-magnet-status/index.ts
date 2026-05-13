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

function betaLimitError(message: string, details?: Record<string, unknown>) {
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const identity = await verifyFirebaseToken(req);
    const body = await req.json().catch(() => ({})) as {
      id?: string;
      status?: Status;
      delivery?: {
        deliveryEmailEnabled?: boolean;
        deliveryEmailSubject?: string | null;
        deliveryEmailBody?: string | null;
      };
    };

    if (!body.id || !body.status) {
      return jsonResponse({ error: "Missing id or status" }, { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: currentMagnet, error: currentMagnetError } = await supabase
      .from("lead_magnets")
      .select("id,workspace_id,status")
      .eq("id", body.id)
      .eq("owner_external_id", identity.uid)
      .maybeSingle();

    if (currentMagnetError) throw currentMagnetError;
    if (!currentMagnet) {
      return jsonResponse({ error: "Lead magnet not found" }, { status: 404 });
    }

    const { data: workspace, error: workspaceError } = await supabase
      .from("workspaces")
      .select("id,beta_status,lead_magnet_limit")
      .eq("id", currentMagnet.workspace_id)
      .maybeSingle();

    if (workspaceError) throw workspaceError;
    if (workspace?.beta_status === "blocked" || workspace?.beta_status === "waitlist") {
      return betaLimitError("This workspace is not active yet. Email us to unlock beta access.", {
        betaStatus: workspace.beta_status,
      });
    }

    if (body.status === "published" && currentMagnet.status !== "published") {
      const { count: publishedCount, error: publishedCountError } = await supabase
        .from("lead_magnets")
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", currentMagnet.workspace_id)
        .eq("status", "published");

      if (publishedCountError) throw publishedCountError;
      const publishedLimit = workspace?.lead_magnet_limit ?? 3;
      if ((publishedCount ?? 0) >= publishedLimit) {
        return betaLimitError("You have reached the beta limit for live lead magnets. Upgrade beta access to publish more.", {
          limit: publishedLimit,
        });
      }
    }

    const delivery = body.delivery ?? {};
    const updatePayload: Record<string, unknown> = {
      status: body.status,
      published_at: body.status === "published" ? new Date().toISOString() : null,
    };

    if (typeof delivery.deliveryEmailEnabled === "boolean") {
      updatePayload.delivery_email_enabled = delivery.deliveryEmailEnabled;
    }
    if ("deliveryEmailSubject" in delivery) {
      updatePayload.delivery_email_subject = delivery.deliveryEmailSubject?.trim() || null;
    }
    if ("deliveryEmailBody" in delivery) {
      updatePayload.delivery_email_body = delivery.deliveryEmailBody?.trim() || null;
    }

    const { data, error } = await supabase
      .from("lead_magnets")
      .update(updatePayload)
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
