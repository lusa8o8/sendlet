import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return jsonResponse({ error: "Method not allowed" }, { status: 405 });
  }

  const url = new URL(req.url);
  const slug = url.searchParams.get("slug")?.trim();

  if (!slug) {
    return jsonResponse({ error: "Missing slug" }, { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  const { data, error } = await supabase
    .from("lead_magnets")
    .select(`
      id,
      workspace_id,
      title,
      slug,
      description,
      cta_label,
      accent_color,
      background_preset,
      layout,
      page_config,
      file_name,
      resource_type,
      status
    `)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    return jsonResponse({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return jsonResponse({ error: "Not found" }, { status: 404 });
  }

  return jsonResponse({ magnet: data });
});
