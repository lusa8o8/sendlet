export type PublicMagnet = {
  title?: string | null;
  description?: string | null;
  accent_color?: string | null;
  page_config?: {
    imageDataUrl?: string | null;
  } | null;
};

export function asString(value: unknown): string {
  if (Array.isArray(value)) return String(value[0] ?? "");
  return typeof value === "string" ? value : "";
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function stripRichText(value: string): string {
  return value
    .replace(/\[#[0-9a-fA-F]{3,8}\]([\s\S]*?)\[\/\]/g, "$1")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, Math.max(0, maxLength - 1)).trim()}...`;
}

export function getBaseUrl(req: { headers?: Record<string, unknown> }): string {
  const proto = asString(req.headers?.["x-forwarded-proto"]) || "https";
  const host =
    asString(req.headers?.["x-forwarded-host"]) ||
    asString(req.headers?.host) ||
    "sendlet.trymyapp.uk";
  return `${proto}://${host}`;
}

export async function fetchPublicMagnet(slug: string): Promise<PublicMagnet | null> {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey || !slug) return null;

  const response = await fetch(
    `${supabaseUrl}/functions/v1/public-magnet?slug=${encodeURIComponent(slug)}`,
    {
      headers: {
        apikey: anonKey,
        authorization: `Bearer ${anonKey}`,
      },
    },
  );

  if (!response.ok) return null;
  const json = await response.json();
  return (json?.magnet ?? json) as PublicMagnet;
}

export function getPreviewText(magnet: PublicMagnet | null) {
  const title = truncate(stripRichText(magnet?.title || "Sendlet"), 90);
  const description = truncate(
    stripRichText(
      magnet?.description ||
        "Get the resource instantly. Sendlet delivers the file after a simple opt-in.",
    ),
    160,
  );
  const accent = /^#[0-9a-fA-F]{6}$/.test(magnet?.accent_color || "")
    ? magnet?.accent_color || "#008575"
    : "#008575";

  return { title, description, accent };
}
