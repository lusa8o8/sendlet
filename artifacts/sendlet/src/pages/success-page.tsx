import { useParams, Link } from "wouter";
import { leadMagnets } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Check, Download } from "lucide-react";
import NotFound from "./not-found";

export default function SuccessPage() {
  const { slug } = useParams();

  const magnet = leadMagnets.find((m) => m.slug === slug);

  if (!magnet) return <NotFound />;

  const accent = magnet.accentColor ?? "#0F766E";
  const imgPos = magnet.imagePosition ?? { x: 50, y: 50 };

  const showImage =
    !!magnet.imageDataUrl &&
    !(
      (magnet.layout === "split" || magnet.layout === "stacked") &&
      magnet.leftType === "text"
    );

  const { name: creatorName, avatar: creatorAvatar } = (() => {
    try {
      const raw = localStorage.getItem("sendlet_profile");
      if (raw) return JSON.parse(raw) as { name: string; avatar: string };
    } catch {}
    return { name: "Sarah Chen", avatar: "" };
  })();

  return (
    <div className="min-h-[100dvh] flex flex-col font-sans">
      {/* ── Brand band ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative shrink-0 overflow-hidden"
        style={{
          height: "38vh",
          minHeight: 200,
          backgroundColor: accent,
          ...(showImage
            ? {
                backgroundImage: `url(${magnet.imageDataUrl})`,
                backgroundSize: "cover",
                backgroundPosition: `${imgPos.x}% ${imgPos.y}%`,
              }
            : {}),
        }}
      >
        {/* dot texture when no image */}
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

        {/* darkening overlay */}
        {showImage && (
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/10 to-black/40" />
        )}

        {/* soft bottom fade into page bg */}
        <div
          className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
          style={{
            background: showImage
              ? "linear-gradient(to bottom, transparent, rgba(0,0,0,0.25))"
              : `linear-gradient(to bottom, transparent, ${accent}cc)`,
          }}
        />

        {/* Creator identity — bottom-left */}
        <div className="absolute bottom-4 left-5 flex items-center gap-2 z-10">
          <div className="w-7 h-7 rounded-full bg-white/90 shadow flex items-center justify-center font-semibold text-[10px] overflow-hidden shrink-0" style={{ color: accent }}>
            {creatorAvatar
              ? <img src={creatorAvatar} alt="" className="w-full h-full object-cover" />
              : creatorName.charAt(0).toUpperCase()}
          </div>
          <span className="text-[11px] font-medium text-white drop-shadow">
            {creatorName}
          </span>
        </div>
      </motion.div>

      {/* ── Success content ── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-background px-5 py-10">
        {/* Animated check */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.2 }}
          className="w-16 h-16 rounded-full flex items-center justify-center shadow-md mb-6"
          style={{ backgroundColor: accent }}
        >
          <motion.div
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.45 }}
          >
            <Check className="h-8 w-8 text-white" strokeWidth={2.5} />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="w-full max-w-sm text-center"
        >
          <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">
            You're all set!
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed mb-8">
            Your copy of <span className="font-semibold text-foreground">{magnet.title}</span> is ready.
            {" "}We've also sent a copy to your email.
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
      </div>
    </div>
  );
}
