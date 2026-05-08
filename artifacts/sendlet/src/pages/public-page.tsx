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

const BULLETS = [
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
}: {
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  email: string;
  setEmail: (v: string) => void;
  accentColor: string;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 pt-4 border-t border-border">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">
          Where should we send it?
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email address"
          className="h-11"
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
        {isLoading ? "Sending…" : "Get the resource"}
      </Button>
      <p className="text-center text-xs text-muted-foreground pt-2">
        No spam. Unsubscribe anytime.
      </p>
    </form>
  );
}

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
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              {magnet.description}
            </p>
            <ul className="space-y-4 mb-8">
              {bullets.map((bullet, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div
                    className="mt-0.5 p-1 rounded-full shrink-0"
                    style={{ backgroundColor: `${magnet.accentColor}22` }}
                  >
                    <Check className="h-3 w-3" style={{ color: magnet.accentColor }} />
                  </div>
                  <span className="text-foreground/90">{bullet}</span>
                </li>
              ))}
            </ul>
            <OptInForm
              onSubmit={onSubmit}
              isLoading={isLoading}
              email={email}
              setEmail={setEmail}
              accentColor={magnet.accentColor}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

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
  return (
    <div className="min-h-[100dvh] flex flex-col lg:flex-row">
      {/* Left: visual panel */}
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="lg:w-[55%] xl:w-[60%] min-h-[260px] lg:min-h-screen relative flex flex-col justify-end"
        style={{ backgroundColor: magnet.accentColor }}
      >
        {/* Subtle texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 20%, white 1px, transparent 1px), radial-gradient(circle at 70% 60%, white 1px, transparent 1px), radial-gradient(circle at 50% 80%, white 1px, transparent 1px)",
            backgroundSize: "80px 80px, 120px 120px, 60px 60px",
          }}
        />

        {/* Image placeholder overlay — shown on top of colour */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white/20 select-none pointer-events-none">
            <div className="w-24 h-24 rounded-2xl border-2 border-white/15 flex items-center justify-center mx-auto mb-3">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24">
                <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M4 8h.01M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-xs font-medium">Your image goes here</p>
          </div>
        </div>

        {/* Creator identity at bottom of visual panel */}
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
          <p className="text-base text-muted-foreground mb-8 leading-relaxed">
            {magnet.description}
          </p>

          <ul className="space-y-3 mb-8">
            {bullets.map((bullet, i) => (
              <li key={i} className="flex items-start gap-3">
                <div
                  className="mt-0.5 p-1 rounded-full shrink-0"
                  style={{ backgroundColor: `${magnet.accentColor}22` }}
                >
                  <Check className="h-3 w-3" style={{ color: magnet.accentColor }} />
                </div>
                <span className="text-foreground/90 text-sm">{bullet}</span>
              </li>
            ))}
          </ul>

          <OptInForm
            onSubmit={onSubmit}
            isLoading={isLoading}
            email={email}
            setEmail={setEmail}
            accentColor={magnet.accentColor}
          />
        </div>
      </motion.div>
    </div>
  );
}

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
    bullets: BULLETS,
    onSubmit: handleSubmit,
    isLoading,
    email,
    setEmail,
  };

  if (magnet.layout === "split") {
    return <SplitLayout {...sharedProps} />;
  }

  return <SimpleLayout {...sharedProps} gradient={gradient} />;
}
