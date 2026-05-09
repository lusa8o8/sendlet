import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Send, ArrowRight, Upload, Palette, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useEffect } from "react";

const steps = [
  {
    num: "01",
    icon: Upload,
    title: "Upload your resource",
    desc: "Drop the PDF, ZIP, or video you're giving away — or paste a link to anything hosted online.",
  },
  {
    num: "02",
    icon: Palette,
    title: "Customise the opt-in page",
    desc: "Pick a layout, set your colours, add your copy. The page builds itself around your file.",
  },
  {
    num: "03",
    icon: Zap,
    title: "Publish and collect leads",
    desc: "Go live in one click. Every signup gets your resource automatically.",
  },
];

export default function LandingPage() {
  const { isSignedIn } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isSignedIn) setLocation("/dashboard");
  }, [isSignedIn, setLocation]);

  if (isSignedIn) return null;

  return (
    <div className="min-h-[100dvh] flex flex-col font-sans">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <div className="bg-[#0C4A44] flex flex-col" style={{ minHeight: "62vh" }}>

        {/* Nav */}
        <div className="flex items-center justify-between px-6 lg:px-12 h-16 shrink-0">
          <div className="flex items-center gap-2">
            <Send className="h-4 w-4 text-white/80" />
            <span className="font-semibold text-sm tracking-tight text-white">Sendlet</span>
          </div>
          <Link href="/sign-in">
            <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10 h-9 px-4 text-sm">
              Sign in
            </Button>
          </Link>
        </div>

        {/* Hero content */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 pb-16 pt-4">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <p className="text-[10px] font-semibold tracking-widest uppercase text-white/35 mb-5">
              Structured lead magnet launcher
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-[52px] font-bold text-white leading-[1.12] tracking-tight mb-5">
              Publish your resource.<br />
              Collect the lead.<br />
              That's it.
            </h1>
            <p className="text-white/55 text-base sm:text-lg leading-relaxed mb-9 max-w-md mx-auto">
              Upload what you're giving away, pick a layout, and get a gated opt-in page — in minutes.
              No funnel builder. No bloat.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                asChild
                className="h-12 px-7 text-[15px] font-semibold gap-2 bg-white text-[#0C4A44] hover:bg-white/92 shadow-md"
              >
                <Link href="/lead-magnets/upload">
                  Upload your lead magnet
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                className="h-12 px-5 text-white/60 hover:text-white hover:bg-white/10 text-sm"
              >
                <Link href="/sign-in">
                  Sign in to your account
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Steps ────────────────────────────────────────────── */}
      <div className="bg-background flex-1 px-6 py-16 lg:py-20">
        <div className="max-w-3xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-10 sm:gap-12">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 + i * 0.1 }}
                  className="flex flex-col gap-3"
                >
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[10px] font-bold tracking-widest text-muted-foreground/40">{step.num}</span>
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────────── */}
      <div className="border-t">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Send className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Sendlet</span>
          </div>
          <p className="text-xs text-muted-foreground">No credit card. No complex setup.</p>
        </div>
      </div>
    </div>
  );
}
