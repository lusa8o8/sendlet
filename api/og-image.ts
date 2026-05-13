import { asString, escapeHtml, fetchPublicMagnet, getPreviewText } from "./_preview";

declare const Buffer: any;

function sendDataUrlImage(dataUrl: string, res: any) {
  const match = dataUrl.match(/^data:(image\/(?:png|jpe?g|webp));base64,([a-zA-Z0-9+/=]+)$/);
  if (!match) return false;

  const [, contentType, base64] = match;
  const buffer = Buffer.from(base64, "base64");
  res.setHeader("Content-Type", contentType);
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=86400");
  res.status(200).send(buffer);
  return true;
}

function wrapText(text: string, maxChars: number, maxLines: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }

    if (lines.length === maxLines) break;
  }

  if (current && lines.length < maxLines) lines.push(current);
  return lines;
}

export default async function handler(req: any, res: any) {
  const slug = asString(req.query?.slug);

  let magnet = null;
  try {
    magnet = await fetchPublicMagnet(slug);
  } catch {
    magnet = null;
  }

  if (magnet?.page_config?.imageDataUrl && sendDataUrlImage(magnet.page_config.imageDataUrl, res)) {
    return;
  }

  const { title, description, accent } = getPreviewText(magnet);
  const titleLines = wrapText(title, 31, 3);
  const descriptionLines = wrapText(description, 58, 2);

  const titleSvg = titleLines
    .map((line, index) => `<tspan x="96" dy="${index === 0 ? 0 : 64}">${escapeHtml(line)}</tspan>`)
    .join("");
  const descriptionSvg = descriptionLines
    .map((line, index) => `<tspan x="96" dy="${index === 0 ? 0 : 34}">${escapeHtml(line)}</tspan>`)
    .join("");

  const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#F8FAF7"/>
  <rect x="0" y="0" width="1200" height="630" fill="url(#bg)"/>
  <circle cx="1012" cy="124" r="190" fill="${escapeHtml(accent)}" opacity="0.12"/>
  <circle cx="156" cy="524" r="220" fill="#0A8CFF" opacity="0.08"/>
  <rect x="64" y="64" width="1072" height="502" rx="36" fill="white" stroke="#DDE5DE"/>
  <g transform="translate(96 98)">
    <path d="M42 4 8 20l16 8 8 22 16-42-42 16" stroke="${escapeHtml(accent)}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="70" y="34" font-family="Inter, Arial, sans-serif" font-size="30" font-weight="700" fill="#0B1514">Sendlet</text>
  </g>
  <text x="96" y="260" font-family="Inter, Arial, sans-serif" font-size="58" font-weight="760" fill="#071312">${titleSvg}</text>
  <text x="96" y="470" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="450" fill="#425653">${descriptionSvg}</text>
  <rect x="96" y="510" width="250" height="54" rx="14" fill="${escapeHtml(accent)}"/>
  <text x="128" y="545" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="700" fill="white">Get the resource</text>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop stop-color="${escapeHtml(accent)}" stop-opacity="0.10"/>
      <stop offset="0.52" stop-color="#F8FAF7" stop-opacity="0"/>
      <stop offset="1" stop-color="#BFE8FF" stop-opacity="0.24"/>
    </linearGradient>
  </defs>
</svg>`;

  res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=86400");
  res.status(200).send(svg);
}
