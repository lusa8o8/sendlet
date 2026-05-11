import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { createRemoteJWKSet, jwtVerify } from "https://esm.sh/jose@5.10.0";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

type PublishBody = {
  magnet: {
    id: string;
    title: string;
    slug: string;
    description?: string;
    status?: "draft" | "published" | "paused";
    ctaLabel?: string;
    accentColor?: string;
    backgroundPreset?: string;
    layout?: string;
    bullets?: string[];
    bulletsEnabled?: boolean;
    imageDataUrl?: string | null;
    leftType?: "image" | "text";
    leftPanelWidth?: number;
    imagePosition?: { x: number; y: number };
    bannerHeight?: number;
    textElements?: Record<string, unknown>;
    hiddenBlocks?: string[];
    tagline?: string;
    nameFieldMode?: "off" | "optional" | "required";
    creatorName?: string;
    creatorAvatar?: string;
  };
  upload?: {
    fileName?: string;
    fileSize?: number;
    fileType?: string;
    fileDataUrl?: string | null;
    linkUrl?: string;
  } | null;
};

function requiredEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

function dataUrlToBytes(dataUrl: string) {
  const [meta, encoded] = dataUrl.split(",");
  const mime = meta.match(/data:(.*?);base64/)?.[1] ?? "application/octet-stream";
  const binary = atob(encoded ?? "");
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return { bytes, mime };
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const identity = await verifyFirebaseToken(req);
    const body = (await req.json()) as PublishBody;
    const magnet = body.magnet;

    if (!magnet?.id || !magnet.title || !magnet.slug) {
      return jsonResponse({ error: "Missing required magnet fields" }, { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const workspaceName = identity.email ? `${identity.email}'s workspace` : "Sendlet workspace";
    const { data: existingWorkspace } = await supabase
      .from("workspaces")
      .select("id")
      .eq("owner_external_id", identity.uid)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    let workspaceId = existingWorkspace?.id as string | undefined;

    if (!workspaceId) {
      const { data: workspace, error: workspaceError } = await supabase
        .from("workspaces")
        .insert({
          name: workspaceName,
          owner_external_id: identity.uid,
          owner_email: identity.email,
        })
        .select("id")
        .single();

      if (workspaceError) throw workspaceError;
      workspaceId = workspace.id;

    }

    const upload = body.upload ?? null;
    const resourceUrl = upload?.linkUrl?.trim() || null;
    const resourceType = resourceUrl ? "external_url" : upload?.fileDataUrl ? "file" : "none";
    let resourceFilePath: string | null = null;

    if (!resourceUrl && upload?.fileDataUrl && upload.fileName) {
      const { bytes, mime } = dataUrlToBytes(upload.fileDataUrl);
      resourceFilePath = `${workspaceId}/${magnet.id}/${upload.fileName}`;
      const { error: uploadError } = await supabase.storage
        .from("lead-magnet-assets")
        .upload(resourceFilePath, bytes, {
          contentType: upload.fileType || mime,
          upsert: true,
        });
      if (uploadError) throw uploadError;
    }

    const payload = {
      id: magnet.id,
      workspace_id: workspaceId,
      owner_external_id: identity.uid,
      owner_email: identity.email,
      title: magnet.title,
      slug: magnet.slug,
      description: magnet.description ?? "",
      status: magnet.status ?? "draft",
      resource_type: resourceType,
      resource_url: resourceUrl,
      resource_file_path: resourceFilePath,
      file_name: upload?.fileName ?? null,
      file_size: upload?.fileSize ?? null,
      cta_label: magnet.ctaLabel ?? "Get the resource",
      accent_color: magnet.accentColor ?? "#0F766E",
      background_preset: magnet.backgroundPreset ?? "dusk",
      layout: magnet.layout ?? "simple",
      page_config: {
        bullets: magnet.bullets ?? [],
        bulletsEnabled: magnet.bulletsEnabled ?? true,
        imageDataUrl: magnet.imageDataUrl ?? null,
        leftType: magnet.leftType ?? "image",
        leftPanelWidth: magnet.leftPanelWidth ?? 48,
        imagePosition: magnet.imagePosition ?? { x: 50, y: 50 },
        bannerHeight: magnet.bannerHeight ?? 44,
        textElements: magnet.textElements ?? {},
        hiddenBlocks: magnet.hiddenBlocks ?? [],
        tagline: magnet.tagline ?? "",
        nameFieldMode: magnet.nameFieldMode ?? "off",
        creatorName: magnet.creatorName ?? "Sendlet creator",
        creatorAvatar: magnet.creatorAvatar ?? "",
      },
    };

    const { data, error } = await supabase
      .from("lead_magnets")
      .upsert(payload, { onConflict: "id" })
      .select()
      .single();

    if (error) throw error;

    await supabase.from("agent_events").insert({
      workspace_id: workspaceId,
      kind: "lead_magnet.created",
      subject_type: "lead_magnet",
      subject_id: magnet.id,
      summary: `Lead magnet saved: ${magnet.title}`,
      payload: { owner_external_id: identity.uid, slug: magnet.slug },
    });

    return jsonResponse({ ok: true, magnet: data });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 401 },
    );
  }
});
