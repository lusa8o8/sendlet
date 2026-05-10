import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, { status: 405 });
  }

  const body = await req.json().catch(() => ({})) as {
    email?: string;
    magnetId?: string;
  };
  const email = normalizeEmail(body.email ?? "");
  const magnetId = body.magnetId?.trim();

  if (!email || !magnetId) {
    return jsonResponse({ error: "Missing email or magnet id" }, { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  const { data: magnet, error: magnetError } = await supabase
    .from("lead_magnets")
    .select("id,workspace_id")
    .eq("id", magnetId)
    .maybeSingle();

  if (magnetError) {
    return jsonResponse({ error: magnetError.message }, { status: 500 });
  }

  if (!magnet) {
    return jsonResponse({ error: "Resource not found" }, { status: 404 });
  }

  const { error } = await supabase
    .from("unsubscribes")
    .upsert({
      workspace_id: magnet.workspace_id,
      lead_magnet_id: magnet.id,
      email,
      scope: "lead_magnet",
    }, { onConflict: "lead_magnet_id,email" });

  if (error) {
    return jsonResponse({ error: error.message }, { status: 500 });
  }

  return jsonResponse({ ok: true });
});
