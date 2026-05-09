import { useParams, Link } from "wouter";
import { leadMagnets } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Check, Download } from "lucide-react";
import NotFound from "./not-found";

function getProfile() {
  try {
    const raw = localStorage.getItem("sendlet_profile");
    if (raw) return JSON.parse(raw) as { name: string; avatar: string };
  } catch {}
  return { name: "Sarah Chen", avatar: "" };
}

/* ── Shared success card content ─────────────────────────── */
function SuccessCard({
  title,
  slug,
  accent,
  align = "center",
}: {
  title: string;
  slug: string;
  accent: string;
  align?: "center" | "left";
}) {
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
        We've also sent a copy to your email.
      </p>

      <Button
        asChild
        className="w-full h-12 text-[15px] font-semibold shadow-sm gap-2 mb-4"
        style={{ backgroundColor: accent, color: "#fff" }}
      >
        <a href="#" download>
          <Download className="h-4 w-4" />
          Download Resource
        </a>
      </Button>

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
}: {
  magnet: (typeof leadMagnets)[0];
  accent: string;
  showImage: boolean;
  imgPos: { x: number; y: number };
  creatorName: string;
  creatorAvatar: string;
  slug: string;
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
        <SuccessCard title={magnet.title} slug={slug} accent={accent} align="left" />
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
}: {
  magnet: (typeof leadMagnets)[0];
  accent: string;
  showImage: boolean;
  imgPos: { x: number; y: number };
  creatorName: string;
  creatorAvatar: string;
  slug: string;
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
        <SuccessCard title={magnet.title} slug={slug} accent={accent} />
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────── */
export default function SuccessPage() {
  const { slug } = useParams();
  const magnet = leadMagnets.find((m) => m.slug === slug);

  if (!magnet) return <NotFound />;

  const accent = magnet.accentColor ?? "#0F766E";
  const imgPos = magnet.imagePosition ?? { x: 50, y: 50 };
  const { name: creatorName, avatar: creatorAvatar } = getProfile();

  const showImage =
    !!magnet.imageDataUrl &&
    !(
      (magnet.layout === "split" || magnet.layout === "stacked") &&
      magnet.leftType === "text"
    );

  const shared = { magnet, accent, showImage, imgPos, creatorName, creatorAvatar, slug: slug! };

  if (magnet.layout === "split") return <SplitSuccess {...shared} />;
  return <StackedSuccess {...shared} />;
}
