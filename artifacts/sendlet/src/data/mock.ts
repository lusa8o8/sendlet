const STORAGE_KEY = "sendlet_magnets";
const BROADCASTS_KEY = "sendlet_broadcasts";

type TextEl = {
  x: number;
  y: number;
  w: number;
  size: number;
  color: string;
  backdrop?: "none" | "glass" | "card";
};

export type LeadMagnet = {
  id: string;
  title: string;
  slug: string;
  description: string;
  status: "published" | "draft" | "paused";
  visits: number;
  weeklyVisits: number;
  leads: number;
  weeklyLeads: number;
  conversionRate: number;
  lastLead: string | null;
  accentColor: string;
  backgroundPreset: string;
  layout: string;
  createdAt: string;
  // Full form state saved at publish time
  bullets?: string[];
  bulletsEnabled?: boolean;
  ctaLabel?: string;
  imageDataUrl?: string | null;
  leftType?: "image" | "text";
  leftPanelWidth?: number;
  imagePosition?: { x: number; y: number };
  bannerHeight?: number;
  textElements?: Record<string, TextEl>;
  hiddenBlocks?: string[];
  fileName?: string;
  fileSize?: number;
  resourceUrl?: string | null;
  resourceType?: "file" | "external_url" | "none";
  tagline?: string;
  activeIntegrations?: string[];
};

const SEED: LeadMagnet[] = [
  {
    id: "1",
    title: "Client Onboarding Checklist",
    slug: "onboarding-checklist",
    description: "A simple checklist for service businesses.",
    status: "published",
    visits: 342,
    weeklyVisits: 28,
    leads: 89,
    weeklyLeads: 12,
    conversionRate: 26,
    lastLead: "2026-05-06",
    accentColor: "#0F766E",
    backgroundPreset: "dusk",
    layout: "simple",
    createdAt: "2026-04-15",
    bullets: ["A clear, step-by-step process", "Templates for client communication", "Avoid common pitfalls and delays"],
    bulletsEnabled: true,
    ctaLabel: "Get the checklist",
  },
  {
    id: "2",
    title: "Freelance Rate Calculator",
    slug: "rate-calculator",
    description: "Know exactly what to charge.",
    status: "draft",
    visits: 0,
    weeklyVisits: 0,
    leads: 0,
    weeklyLeads: 0,
    conversionRate: 0,
    lastLead: null,
    accentColor: "#2563EB",
    backgroundPreset: "aurora",
    layout: "split",
    createdAt: "2026-05-01",
    bullets: ["Hourly vs project pricing", "Factor in taxes and expenses", "Never undersell yourself again"],
    bulletsEnabled: true,
    ctaLabel: "Get the calculator",
  },
  {
    id: "3",
    title: "5-Day Email Course Outline",
    slug: "email-course-outline",
    description: "A template for your first email course.",
    status: "paused",
    visits: 128,
    weeklyVisits: 0,
    leads: 31,
    weeklyLeads: 0,
    conversionRate: 24,
    lastLead: "2026-04-28",
    accentColor: "#0F766E",
    backgroundPreset: "bloom",
    layout: "simple",
    createdAt: "2026-03-20",
    bullets: ["Daily lesson structure", "Email subject line templates", "Re-engagement sequences"],
    bulletsEnabled: true,
    ctaLabel: "Get the outline",
  },
];

function loadMagnets(): LeadMagnet[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as LeadMagnet[];
  } catch {}
  return JSON.parse(JSON.stringify(SEED));
}

function persistMagnets() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leadMagnets));
  } catch {}
}

export const leadMagnets: LeadMagnet[] = loadMagnets();

export function saveMagnet(magnet: LeadMagnet) {
  leadMagnets.push(magnet);
  persistMagnets();
}

export function updateMagnet(id: string, updates: Partial<LeadMagnet>) {
  const idx = leadMagnets.findIndex((m) => m.id === id);
  if (idx !== -1) {
    leadMagnets[idx] = { ...leadMagnets[idx], ...updates };
    persistMagnets();
  }
}

export function removeMagnet(id: string) {
  const idx = leadMagnets.findIndex((m) => m.id === id);
  if (idx !== -1) {
    leadMagnets.splice(idx, 1);
    persistMagnets();
  }
}

export type Broadcast = {
  id: string;
  magnetId: string;
  subject: string;
  sentAt: string;
  recipientCount: number;
  provider: string;
};

const BROADCAST_SEED: Broadcast[] = [
  {
    id: "b1",
    magnetId: "1",
    subject: "Client Onboarding Checklist — it's free",
    sentAt: "2026-05-01",
    recipientCount: 89,
    provider: "resend",
  },
  {
    id: "b2",
    magnetId: "3",
    subject: "5-Day Email Course — grab it now",
    sentAt: "2026-04-20",
    recipientCount: 31,
    provider: "kit",
  },
];

function loadBroadcasts(): Broadcast[] {
  try {
    const raw = localStorage.getItem(BROADCASTS_KEY);
    if (raw) return JSON.parse(raw) as Broadcast[];
  } catch {}
  return JSON.parse(JSON.stringify(BROADCAST_SEED));
}

function persistBroadcasts() {
  try {
    localStorage.setItem(BROADCASTS_KEY, JSON.stringify(broadcasts));
  } catch {}
}

export const broadcasts: Broadcast[] = loadBroadcasts();

export function saveBroadcast(broadcast: Broadcast) {
  broadcasts.unshift(broadcast);
  persistBroadcasts();
}

export const leads = [
  {
    id: "1",
    email: "alex@studiomade.co",
    leadMagnet: "Client Onboarding Checklist",
    source: "twitter.com",
    createdAt: "2026-05-06",
  },
  {
    id: "2",
    email: "priya.k@hey.com",
    leadMagnet: "Client Onboarding Checklist",
    source: "direct",
    createdAt: "2026-05-05",
  },
  {
    id: "3",
    email: "marcus.t@gmail.com",
    leadMagnet: "5-Day Email Course Outline",
    source: "linkedin.com",
    createdAt: "2026-05-03",
  },
  {
    id: "4",
    email: "hello@withwren.com",
    leadMagnet: "Client Onboarding Checklist",
    source: "direct",
    createdAt: "2026-05-02",
  },
  {
    id: "5",
    email: "j.okonkwo@proton.me",
    leadMagnet: "5-Day Email Course Outline",
    source: "substack.com",
    createdAt: "2026-04-28",
  },
];
