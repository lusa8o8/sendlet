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
  const bullets = [
    "A clear, step-by-step process",
    "Templates for client communication",
    "Avoid common pitfalls and delays",
  ];

  const gradient = GRADIENT_PRESETS[magnet.backgroundPreset ?? "none"] ?? null;
  const bgStyle = gradient ? { background: gradient } : {};

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setLocation(`/p/${slug}/success`);
    }, 1000);
  };

  return (
    <div
      className="min-h-[100dvh] flex flex-col items-center py-12 px-4 sm:py-24"
      style={gradient ? bgStyle : { backgroundColor: "hsl(var(--background))" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[480px]"
      >
        {/* Creator identity */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white font-semibold text-lg text-foreground mb-3 shadow-md ring-4 ring-white/50">
            {creatorName.charAt(0)}
          </div>
          <p className="text-sm font-medium text-foreground/70">{creatorName}</p>
        </div>

        {/* Card */}
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

            <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-border">
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
                style={{ backgroundColor: magnet.accentColor, color: "#FFFFFF" }}
                disabled={isLoading}
                data-testid="button-submit-optin"
              >
                {isLoading ? "Sending…" : "Get the resource"}
              </Button>
              <p className="text-center text-xs text-muted-foreground pt-2">
                No spam. Unsubscribe anytime.
              </p>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
