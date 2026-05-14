import { supabase, SUPABASE_FUNCTIONS_URL } from "@/lib/supabase";
import { getFirebaseIdToken } from "@/lib/firebase";
import type { LeadMagnet } from "@/data/mock";

export class SendletApiError extends Error {
  code?: string;
  upgradeUrl?: string;

  constructor(message: string, code?: string, upgradeUrl?: string) {
    super(message);
    this.name = "SendletApiError";
    this.code = code;
    this.upgradeUrl = upgradeUrl;
  }
}

function throwApiError(payload: Record<string, any>, fallback: string): never {
  throw new SendletApiError(
    typeof payload.error === "string" ? payload.error : fallback,
    typeof payload.code === "string" ? payload.code : undefined,
    typeof payload.upgradeUrl === "string" ? payload.upgradeUrl : undefined,
  );
}

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
    throwApiError(payload, "Could not publish lead magnet");
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
    throwApiError(payload, "Could not update lead magnet status");
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
        nameFieldMode: magnet.nameFieldMode ?? "off",
        creatorName: magnet.creatorName ?? "Sendlet creator",
        creatorAvatar: magnet.creatorAvatar ?? "",
      },
    })
    .eq("id", magnet.id);

  if (error) throw error;
}

export async function fetchPublicMagnet(slug: string) {
  const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/public-magnet?slug=${encodeURIComponent(slug)}&ts=${Date.now()}`, {
    cache: "no-store",
    headers: {
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
  });

  if (!response.ok) return null;
  const payload = await response.json();
  return payload.magnet;
}

export async function captureLead(slug: string, email: string, name?: string) {
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
      name: name?.trim() || undefined,
      referrer: document.referrer || "direct",
      source: new URLSearchParams(window.location.search).get("utm_source") ?? undefined,
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throwApiError(payload, "Could not capture lead");
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

export async function trackPublicVisit(slug: string) {
  const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/track-visit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      slug,
      referrer: document.referrer || "direct",
      source: new URLSearchParams(window.location.search).get("utm_source") ?? undefined,
    }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error ?? "Could not track visit");
  }
}

export async function unsubscribeLead(email: string, magnetId: string) {
  const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/unsubscribe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ email, magnetId }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error ?? "Could not unsubscribe this email.");
  }
  return payload as { ok: boolean };
}

export type LeadWebhook = {
  id: string;
  url: string;
  enabled: boolean;
  last_status: number | null;
  last_error: string | null;
  last_sent_at: string | null;
  updated_at: string | null;
};

export async function fetchLeadWebhook() {
  const token = await getFirebaseIdToken();
  const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/manage-webhook`, {
    headers: {
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error ?? "Could not load webhook settings");
  }
  return (payload.webhook ?? null) as LeadWebhook | null;
}

export async function saveLeadWebhook(url: string, enabled = true) {
  const token = await getFirebaseIdToken();
  const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/manage-webhook`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ url, enabled }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error ?? "Could not save webhook settings");
  }
  return payload.webhook as LeadWebhook;
}

export async function deleteLeadWebhook() {
  const token = await getFirebaseIdToken();
  const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/manage-webhook`, {
    method: "DELETE",
    headers: {
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error ?? "Could not remove webhook settings");
  }
  return true;
}

type RawLeadMagnet = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: "published" | "draft" | "paused";
  resource_type: "file" | "external_url" | "none" | null;
  resource_url: string | null;
  file_name: string | null;
  file_size: number | null;
  cta_label: string | null;
  accent_color: string | null;
  background_preset: string | null;
  layout: string | null;
  page_config: Record<string, any> | null;
  delivery_email_enabled: boolean | null;
  delivery_email_subject: string | null;
  delivery_email_body: string | null;
  visits_count: number | null;
  weekly_visits_count?: number | null;
  leads_count: number | null;
  last_lead_at: string | null;
  created_at: string;
};

type RawLead = {
  id: string;
  email: string;
  source: string | null;
  referrer: string | null;
  metadata: Record<string, any> | null;
  delivered_at: string | null;
  created_at: string;
  lead_magnet_id: string;
  lead_magnets: {
    id: string;
    title: string;
    slug: string;
  } | null;
};

export type WorkspaceLead = {
  id: string;
  email: string;
  name: string | null;
  leadMagnet: string;
  leadMagnetSlug: string;
  source: string;
  referrer: string | null;
  deliveredAt: string | null;
  createdAt: string;
};

export type WorkspaceData = {
  workspace: WorkspaceSummary | null;
  magnets: LeadMagnet[];
  leads: WorkspaceLead[];
};

export type WorkspaceSummary = {
  id: string;
  name: string;
  plan: string;
  betaStatus: string;
  leadMagnetLimit: number;
  monthlyLeadLimit: number;
  monthlyEmailLimit: number;
  fileSizeLimit: number;
};

export type LeadsData = {
  leads: WorkspaceLead[];
  publishedCount: number;
};

function daysAgo(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const diff = Date.now() - date.getTime();
  const days = Math.max(0, Math.floor(diff / 86_400_000));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

function toLeadMagnet(raw: RawLeadMagnet): LeadMagnet {
  const config = raw.page_config ?? {};
  const visits = raw.visits_count ?? 0;
  const leadCount = raw.leads_count ?? 0;

  return {
    id: raw.id,
    title: raw.title,
    slug: raw.slug,
    description: raw.description ?? "",
    status: raw.status,
    visits,
    weeklyVisits: raw.weekly_visits_count ?? 0,
    leads: leadCount,
    weeklyLeads: 0,
    conversionRate: visits > 0 ? Math.round((leadCount / visits) * 100) : 0,
    lastLead: daysAgo(raw.last_lead_at),
    accentColor: raw.accent_color ?? "#0F766E",
    backgroundPreset: raw.background_preset ?? "dusk",
    layout: raw.layout ?? "simple",
    createdAt: raw.created_at,
    bullets: Array.isArray(config.bullets) ? config.bullets : [],
    bulletsEnabled: config.bulletsEnabled ?? true,
    ctaLabel: raw.cta_label ?? "Get the resource",
    imageDataUrl: config.imageDataUrl ?? null,
    leftType: config.leftType ?? "image",
    leftPanelWidth: config.leftPanelWidth ?? 48,
    imagePosition: config.imagePosition ?? { x: 50, y: 50 },
    bannerHeight: config.bannerHeight ?? 44,
    textElements: config.textElements ?? {},
    hiddenBlocks: config.hiddenBlocks ?? [],
    fileName: raw.file_name ?? undefined,
    fileSize: raw.file_size ?? undefined,
    resourceUrl: raw.resource_url,
    resourceType: raw.resource_type ?? "none",
    deliveryEmailEnabled: raw.delivery_email_enabled ?? true,
    deliveryEmailSubject: raw.delivery_email_subject,
    deliveryEmailBody: raw.delivery_email_body,
    nameFieldMode: config.nameFieldMode ?? "off",
    tagline: config.tagline ?? "",
    creatorName: config.creatorName ?? "Sendlet creator",
    creatorAvatar: config.creatorAvatar ?? "",
  };
}

function toWorkspaceLead(raw: RawLead): WorkspaceLead {
  const referrer = raw.referrer && raw.referrer !== "direct" ? raw.referrer : null;
  let source = raw.source || referrer || "direct";
  try {
    if (source.startsWith("http")) source = new URL(source).hostname;
  } catch {}

  return {
    id: raw.id,
    email: raw.email,
    name: typeof raw.metadata?.name === "string" ? raw.metadata.name : null,
    leadMagnet: raw.lead_magnets?.title ?? "Untitled",
    leadMagnetSlug: raw.lead_magnets?.slug ?? "",
    source,
    referrer: referrer ?? raw.referrer ?? null,
    deliveredAt: raw.delivered_at,
    createdAt: raw.created_at,
  };
}

function toWorkspaceSummary(raw: Record<string, any> | null | undefined): WorkspaceSummary | null {
  if (!raw?.id) return null;
  return {
    id: raw.id,
    name: raw.name ?? "Sendlet workspace",
    plan: raw.plan ?? "beta_free",
    betaStatus: raw.beta_status ?? "active",
    leadMagnetLimit: raw.lead_magnet_limit ?? 3,
    monthlyLeadLimit: raw.monthly_lead_limit ?? 250,
    monthlyEmailLimit: raw.monthly_email_limit ?? 250,
    fileSizeLimit: raw.file_size_limit ?? 10_485_760,
  };
}

async function fetchWorkspaceDataView(view?: "dashboard" | "leads"): Promise<WorkspaceData> {
  const token = await getFirebaseIdToken();
  const query = view ? `?view=${encodeURIComponent(view)}` : "";
  const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/workspace-data${query}`, {
    headers: {
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error ?? "Could not load workspace data");
  }

  return {
    workspace: toWorkspaceSummary(payload.workspace),
    magnets: ((payload.magnets ?? []) as RawLeadMagnet[]).map(toLeadMagnet),
    leads: ((payload.leads ?? []) as RawLead[]).map(toWorkspaceLead),
  };
}

export async function fetchWorkspaceData(): Promise<WorkspaceData> {
  return fetchWorkspaceDataView();
}

export async function fetchDashboardData(): Promise<Pick<WorkspaceData, "workspace" | "magnets">> {
  const data = await fetchWorkspaceDataView("dashboard");
  return { workspace: data.workspace, magnets: data.magnets };
}

export async function fetchLeadsData(): Promise<LeadsData> {
  const token = await getFirebaseIdToken();
  const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/workspace-data?view=leads`, {
    headers: {
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error ?? "Could not load leads");
  }

  const magnets = (payload.magnets ?? []) as Array<{ status?: string }>;
  return {
    leads: ((payload.leads ?? []) as RawLead[]).map(toWorkspaceLead),
    publishedCount: magnets.filter((magnet) => magnet.status === "published").length,
  };
}
