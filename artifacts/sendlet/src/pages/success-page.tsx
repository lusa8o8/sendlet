import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { leadMagnets, type LeadMagnet } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Check, Download } from "lucide-react";
import NotFound from "./not-found";
import { fetchPublicMagnet } from "@/services/sendlet-service";

function remoteToLeadMagnet(remote: any): LeadMagnet {
  const config = remote.page_config ?? {};
  return {
    id: remote.id,
    title: remote.title,
    slug: remote.slug,
    description: remote.description ?? "",
    status: remote.status ?? "published",
    visits: 0,
    weeklyVisits: 0,
    leads: 0,
    weeklyLeads: 0,
    conversionRate: 0,
    lastLead: null,
    accentColor: remote.accent_color ?? "#0F766E",
    backgroundPreset: remote.background_preset ?? "dusk",
    layout: remote.layout ?? "simple",
    createdAt: "",
    bullets: config.bullets ?? [],
    bulletsEnabled: config.bulletsEnabled ?? true,
    ctaLabel: remote.cta_label ?? "Get the resource",
    imageDataUrl: config.imageDataUrl ?? null,
    leftType: config.leftType ?? "image",
    leftPanelWidth: config.leftPanelWidth ?? 48,
    imagePosition: config.imagePosition ?? { x: 50, y: 50 },
    bannerHeight: config.bannerHeight ?? 44,
    textElements: config.textElements ?? {},
    hiddenBlocks: config.hiddenBlocks ?? [],
    fileName: remote.file_name ?? undefined,
    resourceType: remote.resource_type ?? "none",
    resourceUrl: remote.resource_url ?? null,
    tagline: config.tagline ?? "",
    creatorName: config.creatorName ?? "Sendlet creator",
    creatorAvatar: config.creatorAvatar ?? "",
  };
}

/* ── Shared success card content ─────────────────────────── */
function SuccessCard({
  title,
  slug,
  accent,
  accessUrl,
  deliveryStatus,
  align = "center",
}: {
  title: string;
  slug: string;
  accent: string;
  accessUrl?: string | null;
  deliveryStatus?: string | null;
  align?: "center" | "left";
}) {
  const emailWasSent = deliveryStatus === "sent";

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
      className={`w-full max-w-sm ${align === "center" ? "text-center mx-auto" : "text-left"}`}
    >
      {/* Check circle */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 20, delay: 0.2 }}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md mb-6 ${align === "center" ? "mx-auto" : ""}`}
        style={{ backgroundColor: accent }}
      >
        <Check className="h-7 w-7 text-white" strokeWidth={2.5} />
      </motion.div>

      <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">
        You're all set!
      </h1>
      <p className="text-sm text-muted-foreground leading-relaxed mb-8">
        Your copy of{" "}
        <span className="font-semibold text-foreground">{title}</span> is ready.
        {emailWasSent ? " We've also sent a copy to your email." : ""}
      </p>

      {accessUrl ? (
        <Button
          asChild
          className="w-full h-12 text-[15px] font-semibold shadow-sm gap-2 mb-4"
          style={{ backgroundColor: accent, color: "#fff" }}
        >
          <a href={accessUrl} target="_blank" rel="noopener noreferrer">
            <Download className="h-4 w-4" />
            Open Resource
          </a>
        </Button>
      ) : (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 mb-4">
          This page is collecting leads, but no resource file or URL is attached yet.
        </div>
      )}

      <div className="pt-5 border-t border-border">
        <Link
          href={`/p/${slug}`}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to page
        </Link>
      </div>
    </motion.div>
  );
}

/* ── Brand panel (reused in both layouts) ────────────────── */
function BrandPanel({
  accent,
  imageDataUrl,
  showImage,
  imgPos,
  creatorName,
  creatorAvatar,
  className = "",
  style = {},
}: {
  accent: string;
  imageDataUrl?: string | null;
  showImage: boolean;
  imgPos: { x: number; y: number };
  creatorName: string;
  creatorAvatar: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`relative overflow-hidden flex flex-col justify-end ${className}`}
      style={{
        backgroundColor: accent,
        ...(showImage
          ? {
              backgroundImage: `url(${imageDataUrl})`,
              backgroundSize: "cover",
              backgroundPosition: `${imgPos.x}% ${imgPos.y}%`,
            }
          : {}),
        ...style,
      }}
    >
      {!showImage && (
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 25%, white 1px, transparent 1px)",
            backgroundSize: "52px 52px",
          }}
        />
      )}
      {showImage && (
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/10 to-black/40" />
      )}

      {/* Creator identity */}
      <div className="relative z-10 p-6 lg:p-8 flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center font-semibold text-xs overflow-hidden shrink-0"
          style={{ color: accent }}
        >
          {creatorAvatar ? (
            <img src={creatorAvatar} alt="" className="w-full h-full object-cover" />
          ) : (
            creatorName.charAt(0).toUpperCase()
          )}
        </div>
        <span className="text-[12px] font-medium text-white drop-shadow">
          {creatorName}
        </span>
      </div>
    </motion.div>
  );
}

/* ── Split success (vertical side-by-side) ───────────────── */
function SplitSuccess({
  magnet,
  accent,
  showImage,
  imgPos,
  creatorName,
  creatorAvatar,
  slug,
  accessUrl,
  deliveryStatus,
}: {
  magnet: LeadMagnet;
  accent: string;
  showImage: boolean;
  imgPos: { x: number; y: number };
  creatorName: string;
  creatorAvatar: string;
  slug: string;
  accessUrl?: string | null;
  deliveryStatus?: string | null;
}) {
  const panelWidth = magnet.leftPanelWidth ?? 50;

  return (
    <div className="min-h-[100dvh] flex flex-col lg:flex-row">
      {/* Left brand panel */}
      <BrandPanel
        accent={accent}
        imageDataUrl={magnet.imageDataUrl}
        showImage={showImage}
        imgPos={imgPos}
        creatorName={creatorName}
        creatorAvatar={creatorAvatar}
        className="min-h-[220px] lg:min-h-screen"
        style={{ flexBasis: `${panelWidth}%`, flexShrink: 0 }}
      />

      {/* Right success content */}
      <motion.div
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45 }}
        className="flex-1 bg-background flex items-center justify-center px-8 py-14 lg:py-0"
      >
        <SuccessCard title={magnet.title} slug={slug} accent={accent} accessUrl={accessUrl} deliveryStatus={deliveryStatus} align="left" />
      </motion.div>
    </div>
  );
}

/* ── Stacked success (band on top, content below) ────────── */
function StackedSuccess({
  magnet,
  accent,
  showImage,
  imgPos,
  creatorName,
  creatorAvatar,
  slug,
  accessUrl,
  deliveryStatus,
}: {
  magnet: LeadMagnet;
  accent: string;
  showImage: boolean;
  imgPos: { x: number; y: number };
  creatorName: string;
  creatorAvatar: string;
  slug: string;
  accessUrl?: string | null;
  deliveryStatus?: string | null;
}) {
  return (
    <div className="min-h-[100dvh] flex flex-col">
      <BrandPanel
        accent={accent}
        imageDataUrl={magnet.imageDataUrl}
        showImage={showImage}
        imgPos={imgPos}
        creatorName={creatorName}
        creatorAvatar={creatorAvatar}
        style={{ height: "38vh", minHeight: 200 }}
      />
      <div className="flex-1 flex flex-col items-center justify-center bg-background px-5 py-10">
        <SuccessCard title={magnet.title} slug={slug} accent={accent} accessUrl={accessUrl} deliveryStatus={deliveryStatus} />
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────── */
export default function SuccessPage() {
  const { slug } = useParams();
  const [remoteMagnet, setRemoteMagnet] = useState<LeadMagnet | null>(null);
  const [checkedRemote, setCheckedRemote] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    void fetchPublicMagnet(slug)
      .then((remote) => {
        if (!cancelled && remote) setRemoteMagnet(remoteToLeadMagnet(remote));
      })
      .finally(() => {
        if (!cancelled) setCheckedRemote(true);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const magnet = remoteMagnet ?? leadMagnets.find((m) => m.slug === slug);

  if (!magnet && !checkedRemote) return null;

  if (!magnet) return <NotFound />;

  const accent = magnet.accentColor ?? "#0F766E";
  const imgPos = magnet.imagePosition ?? { x: 50, y: 50 };
  const creatorName = magnet.creatorName || "Sendlet creator";
  const creatorAvatar = magnet.creatorAvatar || "";

  const showImage =
    !!magnet.imageDataUrl &&
    !(
      (magnet.layout === "split" || magnet.layout === "stacked") &&
      magnet.leftType === "text"
    );

  const accessUrl = (() => {
    try {
      const raw = sessionStorage.getItem(`sendlet_access_${slug}`) ?? localStorage.getItem(`sendlet_access_${slug}`);
      if (!raw) return null;
      return (JSON.parse(raw) as { accessUrl?: string | null }).accessUrl ?? null;
    } catch {
      return null;
    }
  })();
  const deliveryStatus = (() => {
    try {
      const raw = sessionStorage.getItem(`sendlet_access_${slug}`) ?? localStorage.getItem(`sendlet_access_${slug}`);
      if (!raw) return null;
      return (JSON.parse(raw) as { deliveryStatus?: string | null }).deliveryStatus ?? null;
    } catch {
      return null;
    }
  })();

  const shared = { magnet, accent, showImage, imgPos, creatorName, creatorAvatar, slug: slug!, accessUrl, deliveryStatus };

  if (magnet.layout === "split") return <SplitSuccess {...shared} />;
  return <StackedSuccess {...shared} />;
}
