import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { leadMagnets } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import NotFound from "./not-found";

const GRADIENT_PRESETS: Record<string, string | null> = {
  none: null,
  dusk: "linear-gradient(135deg, #fdd5c4 0%, #fef0d0 42%, #d5e5ff 75%, #e5d5ff 100%)",
  aurora: "linear-gradient(135deg, #c4f0e8 0%, #d5e8ff 55%, #e8d5ff 100%)",
  bloom: "linear-gradient(135deg, #fdd5e8 0%, #fdd5c4 42%, #fef0d0 100%)",
  slate: "linear-gradient(135deg, #dde5f0 0%, #d5dff0 100%)",
  mint: "linear-gradient(135deg, #c4f0e0 0%, #c4ecff 100%)",
};

const FALLBACK_BULLETS = [
  "A clear, step-by-step process",
  "Templates for client communication",
  "Avoid common pitfalls and delays",
];

function OptInForm({
  onSubmit,
  isLoading,
  email,
  setEmail,
  accentColor,
  ctaLabel,
  dark = false,
}: {
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  email: string;
  setEmail: (v: string) => void;
  accentColor: string;
  ctaLabel?: string;
  dark?: boolean;
}) {
  return (
    <form onSubmit={onSubmit} className={`space-y-4 pt-4 border-t ${dark ? "border-white/20" : "border-border"}`}>
      <div className="space-y-2">
        <Label htmlFor="email" className={`text-sm font-medium ${dark ? "text-white/80" : ""}`}>
          Where should we send it?
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email address"
          className={`h-11 ${dark ? "bg-white/10 border-white/30 text-white placeholder:text-white/40 focus-visible:ring-white/30" : ""}`}
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          data-testid="input-email-optin"
        />
      </div>
      <Button
        type="submit"
        className="w-full h-11 text-base font-medium"
        style={{ backgroundColor: accentColor, color: "#FFFFFF" }}
        disabled={isLoading}
        data-testid="button-submit-optin"
      >
        {isLoading ? "Sending…" : (ctaLabel || "Get the resource")}
      </Button>
      <p className={`text-center text-xs pt-2 ${dark ? "text-white/50" : "text-muted-foreground"}`}>
        No spam. Unsubscribe anytime.
      </p>
    </form>
  );
}

function BulletList({ bullets, accentColor, dark = false }: { bullets: string[]; accentColor: string; dark?: boolean }) {
  return (
    <ul className="space-y-3 mb-8">
      {bullets.map((bullet, i) => (
        <li key={i} className="flex items-start gap-3">
          <div
            className="mt-0.5 p-1 rounded-full shrink-0"
            style={{ backgroundColor: dark ? `${accentColor}55` : `${accentColor}22` }}
          >
            <Check className="h-3 w-3" style={{ color: dark ? "#fff" : accentColor }} />
          </div>
          <span className={`${dark ? "text-white/90" : "text-foreground/90"} text-sm`}>{bullet}</span>
        </li>
      ))}
    </ul>
  );
}

/* ── Simple layout ──────────────────────────────────────────── */
function SimpleLayout({
  magnet,
  creatorName,
  bullets,
  gradient,
  onSubmit,
  isLoading,
  email,
  setEmail,
}: {
  magnet: (typeof leadMagnets)[0];
  creatorName: string;
  bullets: string[];
  gradient: string | null;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  email: string;
  setEmail: (v: string) => void;
}) {
  return (
    <div
      className="min-h-[100dvh] flex flex-col items-center py-12 px-4 sm:py-24"
      style={gradient ? { background: gradient } : { backgroundColor: "hsl(var(--background))" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[480px]"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white font-semibold text-lg text-foreground mb-3 shadow-md ring-4 ring-white/50">
            {creatorName.charAt(0)}
          </div>
          <p className="text-sm font-medium text-foreground/70">{creatorName}</p>
        </div>

        <div className="bg-card border shadow-md rounded-2xl overflow-hidden">
          <div className="p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3 text-foreground">
              {magnet.title}
            </h1>
            {magnet.description && (
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                {magnet.description}
              </p>
            )}
            {magnet.bulletsEnabled !== false && bullets.length > 0 && (
              <BulletList bullets={bullets} accentColor={magnet.accentColor} />
            )}
            <OptInForm
              onSubmit={onSubmit}
              isLoading={isLoading}
              email={email}
              setEmail={setEmail}
              accentColor={magnet.accentColor}
              ctaLabel={magnet.ctaLabel}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Visual Split layout ────────────────────────────────────── */
function SplitLayout({
  magnet,
  creatorName,
  bullets,
  onSubmit,
  isLoading,
  email,
  setEmail,
}: {
  magnet: (typeof leadMagnets)[0];
  creatorName: string;
  bullets: string[];
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  email: string;
  setEmail: (v: string) => void;
}) {
  const panelWidth = magnet.leftPanelWidth ?? 50;
  const imgPos = magnet.imagePosition ?? { x: 50, y: 50 };

  return (
    <div className="min-h-[100dvh] flex flex-col lg:flex-row">
      {/* Left: visual panel */}
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="lg:min-h-screen min-h-[260px] relative flex flex-col justify-end overflow-hidden"
        style={{
          flexBasis: `${panelWidth}%`,
          flexShrink: 0,
          backgroundColor: magnet.accentColor,
          ...(magnet.imageDataUrl
            ? {
                backgroundImage: `url(${magnet.imageDataUrl})`,
                backgroundSize: "cover",
                backgroundPosition: `${imgPos.x}% ${imgPos.y}%`,
              }
            : {}),
        }}
      >
        {!magnet.imageDataUrl && (
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 30% 20%, white 1px, transparent 1px), radial-gradient(circle at 70% 60%, white 1px, transparent 1px)",
              backgroundSize: "80px 80px, 120px 120px",
            }}
          />
        )}
        {magnet.imageDataUrl && <div className="absolute inset-0 bg-black/20" />}
        <div className="relative z-10 p-8 lg:p-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold text-sm ring-2 ring-white/30">
              {creatorName.charAt(0)}
            </div>
            <p className="text-sm font-medium text-white/80">{creatorName}</p>
          </div>
        </div>
      </motion.div>

      {/* Right: content + form */}
      <motion.div
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 bg-background flex items-center"
      >
        <div className="w-full max-w-md mx-auto px-8 py-12 lg:py-16">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3 text-foreground">
            {magnet.title}
          </h1>
          {magnet.description && (
            <p className="text-base text-muted-foreground mb-8 leading-relaxed">
              {magnet.description}
            </p>
          )}
          {magnet.bulletsEnabled !== false && bullets.length > 0 && (
            <BulletList bullets={bullets} accentColor={magnet.accentColor} />
          )}
          <OptInForm
            onSubmit={onSubmit}
            isLoading={isLoading}
            email={email}
            setEmail={setEmail}
            accentColor={magnet.accentColor}
            ctaLabel={magnet.ctaLabel}
          />
        </div>
      </motion.div>
    </div>
  );
}

/* ── Stacked layout ─────────────────────────────────────────── */
function StackedLayout({
  magnet,
  creatorName,
  bullets,
  onSubmit,
  isLoading,
  email,
  setEmail,
}: {
  magnet: (typeof leadMagnets)[0];
  creatorName: string;
  bullets: string[];
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  email: string;
  setEmail: (v: string) => void;
}) {
  const bannerPct = magnet.bannerHeight ?? 44;
  const imgPos = magnet.imagePosition ?? { x: 50, y: 50 };

  return (
    <div className="min-h-[100dvh] flex flex-col">
      {/* Banner image */}
      <div
        className="relative shrink-0 overflow-hidden"
        style={{
          height: `${bannerPct}vh`,
          backgroundColor: magnet.accentColor,
          ...(magnet.imageDataUrl
            ? {
                backgroundImage: `url(${magnet.imageDataUrl})`,
                backgroundSize: "cover",
                backgroundPosition: `${imgPos.x}% ${imgPos.y}%`,
              }
            : {}),
        }}
      >
        {!magnet.imageDataUrl && (
          <div className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: "radial-gradient(circle at 30% 20%, white 1px, transparent 1px)",
              backgroundSize: "80px 80px",
            }}
          />
        )}
        {magnet.imageDataUrl && <div className="absolute inset-0 bg-black/15" />}
        <div className="absolute bottom-5 left-6 z-10 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold text-sm ring-2 ring-white/30">
            {creatorName.charAt(0)}
          </div>
          <p className="text-sm font-medium text-white/80">{creatorName}</p>
        </div>
      </div>

      {/* Content below banner */}
      <div className="flex-1 bg-background flex items-start justify-center">
        <div className="w-full max-w-lg px-6 py-10">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3 text-foreground">
            {magnet.title}
          </h1>
          {magnet.description && (
            <p className="text-base text-muted-foreground mb-8 leading-relaxed">
              {magnet.description}
            </p>
          )}
          {magnet.bulletsEnabled !== false && bullets.length > 0 && (
            <BulletList bullets={bullets} accentColor={magnet.accentColor} />
          )}
          <OptInForm
            onSubmit={onSubmit}
            isLoading={isLoading}
            email={email}
            setEmail={setEmail}
            accentColor={magnet.accentColor}
            ctaLabel={magnet.ctaLabel}
          />
        </div>
      </div>
    </div>
  );
}

/* ── Full Image layout ──────────────────────────────────────── */
function FullImageLayout({
  magnet,
  creatorName,
  bullets,
  onSubmit,
  isLoading,
  email,
  setEmail,
}: {
  magnet: (typeof leadMagnets)[0];
  creatorName: string;
  bullets: string[];
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  email: string;
  setEmail: (v: string) => void;
}) {
  const imgPos = magnet.imagePosition ?? { x: 50, y: 50 };

  const glass: React.CSSProperties = {
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    background: "rgba(255,255,255,0.14)",
    border: "1px solid rgba(255,255,255,0.35)",
    borderRadius: "16px",
  };

  return (
    <div
      className="min-h-[100dvh] relative flex flex-col items-center justify-center px-4 py-12 overflow-hidden"
      style={{
        backgroundColor: "#1e293b",
        ...(magnet.imageDataUrl
          ? {
              backgroundImage: `url(${magnet.imageDataUrl})`,
              backgroundSize: "cover",
              backgroundPosition: `${imgPos.x}% ${imgPos.y}%`,
            }
          : { background: "linear-gradient(135deg,#1e293b 0%,#0f4c44 50%,#1e293b 100%)" }),
      }}
    >
      <div className="absolute inset-0 bg-black/30 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md space-y-4"
      >
        {/* Creator badge */}
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl" style={glass}>
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold text-sm ring-2 ring-white/25 shrink-0">
            {creatorName.charAt(0)}
          </div>
          <p className="text-sm font-medium text-white/80">{creatorName}</p>
        </div>

        {/* Headline */}
        <div style={glass} className="px-5 py-4 rounded-2xl">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
            {magnet.title}
          </h1>
          {magnet.description && (
            <p className="text-sm text-white/75 mt-2 leading-relaxed">{magnet.description}</p>
          )}
        </div>

        {/* Bullets */}
        {magnet.bulletsEnabled !== false && bullets.length > 0 && (
          <div style={glass} className="px-5 py-4 rounded-2xl">
            <BulletList bullets={bullets} accentColor={magnet.accentColor} dark />
          </div>
        )}

        {/* Form */}
        <div style={glass} className="px-5 py-4 rounded-2xl">
          <OptInForm
            onSubmit={onSubmit}
            isLoading={isLoading}
            email={email}
            setEmail={setEmail}
            accentColor={magnet.accentColor}
            ctaLabel={magnet.ctaLabel}
            dark
          />
        </div>
      </motion.div>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────── */
export default function PublicPage() {
  const { slug } = useParams();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const magnet = leadMagnets.find((m) => m.slug === slug);

  if (!magnet) {
    return <NotFound />;
  }

  const creatorName = "Sarah Chen";
  const gradient = GRADIENT_PRESETS[magnet.backgroundPreset ?? "none"] ?? null;
  const bullets = magnet.bulletsEnabled !== false
    ? (magnet.bullets?.filter(Boolean) ?? FALLBACK_BULLETS)
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setLocation(`/p/${slug}/success`);
    }, 1000);
  };

  const sharedProps = {
    magnet,
    creatorName,
    bullets,
    onSubmit: handleSubmit,
    isLoading,
    email,
    setEmail,
  };

  if (magnet.layout === "split") return <SplitLayout {...sharedProps} />;
  if (magnet.layout === "stacked") return <StackedLayout {...sharedProps} />;
  if (magnet.layout === "fullimage") return <FullImageLayout {...sharedProps} />;
  return <SimpleLayout {...sharedProps} gradient={gradient} />;
}
