import {
  asString,
  escapeHtml,
  fetchPublicMagnet,
  getBaseUrl,
  getPreviewText,
} from "./_preview";

export default async function handler(req: any, res: any) {
  const slug = asString(req.query?.slug);
  const baseUrl = getBaseUrl(req);
  const publicUrl = `${baseUrl}/p/${encodeURIComponent(slug)}`;

  let magnet = null;
  try {
    magnet = await fetchPublicMagnet(slug);
  } catch {
    magnet = null;
  }

  const { title, description } = getPreviewText(magnet);
  const imageUrl = `${baseUrl}/api/og-image?slug=${encodeURIComponent(slug)}`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=86400");
  res.status(200).send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <link rel="canonical" href="${escapeHtml(publicUrl)}">
    <meta property="og:site_name" content="Sendlet">
    <meta property="og:type" content="website">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${escapeHtml(publicUrl)}">
    <meta property="og:image" content="${escapeHtml(imageUrl)}">
    <meta property="og:image:secure_url" content="${escapeHtml(imageUrl)}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="${escapeHtml(imageUrl)}">
    <meta http-equiv="refresh" content="0;url=${escapeHtml(publicUrl)}">
  </head>
  <body>
    <a href="${escapeHtml(publicUrl)}">${escapeHtml(title)}</a>
  </body>
</html>`);
}
