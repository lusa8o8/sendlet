import { supabase, SUPABASE_FUNCTIONS_URL } from "@/lib/supabase";
import { getFirebaseIdToken } from "@/lib/firebase";
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

export async function saveLeadMagnetToSupabase(
  magnet: LeadMagnet,
  upload?: UploadDraft | null,
) {
  const token = await getFirebaseIdToken();
  const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/publish-magnet`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ magnet, upload }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error ?? "Could not publish lead magnet");
  }
  return payload.magnet;
}

export type DeliverySettings = {
  deliveryEmailEnabled?: boolean;
  deliveryEmailSubject?: string | null;
  deliveryEmailBody?: string | null;
};

export async function updateLeadMagnetStatusInSupabase(
  id: string,
  status: LeadMagnet["status"],
  delivery?: DeliverySettings,
) {
  if (!isUuid(id)) return;

  const token = await getFirebaseIdToken();
  const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/update-magnet-status`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ id, status, delivery }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error ?? "Could not update lead magnet status");
  }
  return payload.magnet;
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
    deliveryStatus?: "queued" | "sent" | "failed" | "skipped";
    deliveryError?: string | null;
    hasResource?: boolean;
  };
}
