import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

type TrackVisitBody = {
  slug?: string;
  source?: string;
  referrer?: string;
};

async function hashValue(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, { status: 405 });
  }

  const body = (await req.json().catch(() => ({}))) as TrackVisitBody;
  const slug = body.slug?.trim();

  if (!slug) {
    return jsonResponse({ error: "Missing slug" }, { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  const { data: magnet, error: magnetError } = await supabase
    .from("lead_magnets")
    .select("id,workspace_id")
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
  const ipHash = forwardedFor ? await hashValue(forwardedFor) : null;

  const { error: visitError } = await supabase.from("lead_magnet_visits").insert({
    workspace_id: magnet.workspace_id,
    lead_magnet_id: magnet.id,
    source: body.source ?? null,
    referrer: body.referrer ?? null,
    user_agent: userAgent,
    ip_hash: ipHash,
  });

  if (visitError) {
    return jsonResponse({ error: visitError.message }, { status: 500 });
  }

  await supabase.rpc("increment_lead_magnet_visits", { magnet_id: magnet.id });

  return jsonResponse({ ok: true });
});
