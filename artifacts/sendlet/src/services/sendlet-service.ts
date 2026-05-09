import { supabase, SUPABASE_FUNCTIONS_URL } from "@/lib/supabase";
import type { LeadMagnet } from "@/data/mock";

type UploadDraft = {
  title?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  fileDataUrl?: string | null;
  linkUrl?: string;
};

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function ensureWorkspace(name?: string) {
  const { data, error } = await supabase.rpc("ensure_default_workspace", {
    workspace_name: name ?? "Sendlet workspace",
  });

  if (error) throw error;
  return data as string;
}

export async function saveLeadMagnetToSupabase(
  magnet: LeadMagnet,
  upload?: UploadDraft | null,
) {
  const { data: userResult, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  const user = userResult.user;
  if (!user) throw new Error("Authentication required");

  const workspaceId = await ensureWorkspace();
  const resourceUrl = upload?.linkUrl || magnet.resourceUrl || null;
  const resourceType = resourceUrl ? "external_url" : upload?.fileName ? "file" : "none";
  let resourceFilePath: string | null = null;

  if (!resourceUrl && upload?.fileDataUrl && upload.fileName) {
    const blob = await fetch(upload.fileDataUrl).then((response) => response.blob());
    resourceFilePath = `${workspaceId}/${magnet.id}/${upload.fileName}`;
    const { error: uploadError } = await supabase.storage
      .from("lead-magnet-assets")
      .upload(resourceFilePath, blob, {
        contentType: upload.fileType || blob.type || "application/octet-stream",
        upsert: true,
      });
    if (uploadError) throw uploadError;
  }

  const { data, error } = await supabase
    .from("lead_magnets")
    .insert({
      id: magnet.id,
      workspace_id: workspaceId,
      owner_id: user.id,
      title: magnet.title,
      slug: magnet.slug,
      description: magnet.description,
      status: magnet.status,
      resource_type: resourceType,
      resource_url: resourceUrl,
      resource_file_path: resourceFilePath,
      file_name: upload?.fileName || magnet.fileName || null,
      file_size: upload?.fileSize || magnet.fileSize || null,
      cta_label: magnet.ctaLabel ?? "Get the resource",
      accent_color: magnet.accentColor,
      background_preset: magnet.backgroundPreset,
      layout: magnet.layout,
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
      },
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateLeadMagnetStatusInSupabase(id: string, status: LeadMagnet["status"]) {
  if (!isUuid(id)) return;

  const { error } = await supabase
    .from("lead_magnets")
    .update({
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
    })
    .eq("id", id);

  if (error) throw error;
}

export async function updateLeadMagnetInSupabase(magnet: LeadMagnet) {
  if (!isUuid(magnet.id)) return;

  const { error } = await supabase
    .from("lead_magnets")
    .update({
      title: magnet.title,
      slug: magnet.slug,
      description: magnet.description,
      accent_color: magnet.accentColor,
      background_preset: magnet.backgroundPreset,
      layout: magnet.layout,
      cta_label: magnet.ctaLabel ?? "Get the resource",
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
      },
    })
    .eq("id", magnet.id);

  if (error) throw error;
}

export async function fetchPublicMagnet(slug: string) {
  const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/public-magnet?slug=${encodeURIComponent(slug)}`, {
    headers: {
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
  });

  if (!response.ok) return null;
  const payload = await response.json();
  return payload.magnet;
}

export async function captureLead(slug: string, email: string) {
  const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/capture-lead`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      slug,
      email,
      referrer: document.referrer || "direct",
      source: new URLSearchParams(window.location.search).get("utm_source") ?? undefined,
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error ?? "Could not capture lead");
  }
  return payload as {
    ok: boolean;
    accessUrl: string | null;
    title: string;
    deliveryEmailEnabled: boolean;
  };
}
