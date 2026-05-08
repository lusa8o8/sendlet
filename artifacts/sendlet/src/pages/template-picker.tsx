import { useState } from "react";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import {
  ListChecks,
  Mail,
  BookOpen,
  Copy,
  ClipboardCheck,
  FileText,
  ArrowRight,
  Check,
  Image,
} from "lucide-react";

const LAYOUTS = [
  {
    id: "simple",
    label: "Simple",
    description: "Centered card on a gradient. Great for any text resource.",
  },
  {
    id: "split",
    label: "Visual Split",
    description: "Hero image panel left, opt-in form right.",
  },
];

const CONTENT_TEMPLATES = [
  { id: "blank", label: "Blank", icon: FileText, description: "Start from scratch" },
  { id: "checklist", label: "Checklist", icon: ListChecks, description: "Step-by-step guide" },
  { id: "email-course", label: "Email Course", icon: Mail, description: "Multi-day series" },
  { id: "pdf-guide", label: "PDF Guide", icon: BookOpen, description: "Comprehensive doc" },
  { id: "swipe-file", label: "Swipe File", icon: Copy, description: "Ready-to-use examples" },
  { id: "mini-audit", label: "Mini-Audit", icon: ClipboardCheck, description: "Self-assessment" },
];

const SAMPLE_BULLETS = ["Benefit one", "Benefit two", "Benefit three"];
const ACCENT = "#0F766E";

function SimplePreview() {
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center px-6 py-8"
      style={{
        background:
          "linear-gradient(135deg, #fdd5c4 0%, #fef0d0 42%, #d5e5ff 75%, #e5d5ff 100%)",
      }}
    >
      <div className="w-12 h-12 rounded-full bg-white shadow-md ring-4 ring-white/50 flex items-center justify-center font-semibold text-sm text-foreground mb-2">
        S
      </div>
      <p className="text-[11px] text-foreground/60 mb-5">Sarah Chen</p>

      <div className="w-full max-w-[280px] bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="p-5">
          <h2 className="text-sm font-bold tracking-tight mb-1 text-foreground">
            Your Resource Title
          </h2>
          <p className="text-[11px] text-muted-foreground mb-4 leading-relaxed">
            A short description of what they'll get and why it helps.
          </p>
          <div className="space-y-2 mb-4">
            {SAMPLE_BULLETS.map((b, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${ACCENT}22` }}
                >
                  <Check className="h-2.5 w-2.5" style={{ color: ACCENT }} />
                </div>
                <span className="text-[11px] text-foreground/80">{b}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-3 space-y-2">
            <div className="h-7 rounded-md border bg-background text-[10px] text-muted-foreground flex items-center px-2.5">
              Enter your email address
            </div>
            <div
              className="h-7 rounded-md text-[10px] text-white flex items-center justify-center font-medium"
              style={{ backgroundColor: ACCENT }}
            >
              Get the resource
            </div>
            <p className="text-center text-[9px] text-muted-foreground">
              No spam. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SplitPreview() {
  return (
    <div className="w-full h-full flex">
      <div
        className="w-[55%] h-full flex flex-col justify-between p-5 relative overflow-hidden shrink-0"
        style={{ backgroundColor: ACCENT }}
      >
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 20%, white 1px, transparent 1px), radial-gradient(circle at 70% 60%, white 1px, transparent 1px)",
            backgroundSize: "60px 60px, 90px 90px",
          }}
        />
        <div className="flex-1 flex items-center justify-center relative z-10">
          <div className="w-16 h-16 rounded-xl border-2 border-white/20 flex items-center justify-center">
            <Image className="h-6 w-6 text-white/25" />
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-white/20 ring-2 ring-white/30 flex items-center justify-center text-white font-semibold text-xs">
            S
          </div>
          <span className="text-white/70 text-[11px]">Sarah Chen</span>
        </div>
      </div>

      <div className="flex-1 bg-white flex items-center">
        <div className="px-5 py-6 w-full">
          <h2 className="text-sm font-bold tracking-tight mb-1 text-foreground">
            Your Resource Title
          </h2>
          <p className="text-[11px] text-muted-foreground mb-4 leading-relaxed">
            A short description of what they'll get and why it helps.
          </p>
          <div className="space-y-2 mb-4">
            {SAMPLE_BULLETS.map((b, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${ACCENT}22` }}
                >
                  <Check className="h-2.5 w-2.5" style={{ color: ACCENT }} />
                </div>
                <span className="text-[11px] text-foreground/80">{b}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-3 space-y-2">
            <div className="h-7 rounded-md border bg-background text-[10px] text-muted-foreground flex items-center px-2.5">
              Enter your email address
            </div>
            <div
              className="h-7 rounded-md text-[10px] text-white flex items-center justify-center font-medium"
              style={{ backgroundColor: ACCENT }}
            >
              Get the resource
            </div>
            <p className="text-center text-[9px] text-muted-foreground">
              No spam. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TemplatePicker() {
  const [, setLocation] = useLocation();
  const [selectedLayout, setSelectedLayout] = useState("simple");
  const [selectedContent, setSelectedContent] = useState("blank");

  const handleStart = () => {
    setLocation(`/lead-magnets/create?layout=${selectedLayout}&content=${selectedContent}`);
  };

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-57px)] overflow-hidden">
        {/* Left: selection panel */}
        <div className="w-full lg:w-[440px] xl:w-[480px] shrink-0 overflow-y-auto border-r">
          <div className="px-8 py-8">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="flex items-start justify-between mb-8"
            >
              <div>
                <p className="text-xs font-medium text-primary uppercase tracking-widest mb-1.5">
                  New lead magnet
                </p>
                <h1 className="text-xl font-semibold tracking-tight">Choose a starting point</h1>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  Pick a layout, then optionally a content type.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="shrink-0 mt-0.5 text-muted-foreground"
              >
                <Link href="/lead-magnets/create">Skip</Link>
              </Button>
            </motion.div>

            {/* Layout */}
            <motion.section
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.05 }}
              className="mb-7"
            >
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                Layout
              </p>
              <div className="space-y-2.5">
                {LAYOUTS.map((layout) => {
                  const isSelected = selectedLayout === layout.id;
                  return (
                    <button
                      key={layout.id}
                      onClick={() => setSelectedLayout(layout.id)}
                      className={`w-full text-left rounded-xl border-2 p-4 transition-all flex items-center gap-4 ${
                        isSelected
                          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                          : "border-border hover:border-foreground/20 bg-card"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                          isSelected ? "border-primary bg-primary" : "border-muted-foreground/30"
                        }`}
                      >
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <div>
                        <p
                          className={`text-sm font-semibold ${
                            isSelected ? "text-primary" : "text-foreground"
                          }`}
                        >
                          {layout.label}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {layout.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.section>

            {/* Content starter */}
            <motion.section
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.1 }}
              className="mb-8"
            >
              <div className="flex items-center gap-2 mb-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Content starter
                </p>
                <span className="text-[10px] font-medium text-muted-foreground border rounded-full px-1.5 py-0.5">
                  Optional
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {CONTENT_TEMPLATES.map((template) => {
                  const Icon = template.icon;
                  const isSelected = selectedContent === template.id;
                  return (
                    <button
                      key={template.id}
                      onClick={() => setSelectedContent(template.id)}
                      className={`text-left rounded-lg border p-3 transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                          : "border-border hover:border-foreground/20 bg-card hover:bg-muted/30"
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-md flex items-center justify-center mb-2 ${
                          isSelected ? "bg-primary/10" : "bg-muted"
                        }`}
                      >
                        <Icon
                          className={`h-3.5 w-3.5 ${
                            isSelected ? "text-primary" : "text-muted-foreground"
                          }`}
                        />
                      </div>
                      <p
                        className={`text-xs font-medium mb-0.5 ${
                          isSelected ? "text-primary" : "text-foreground"
                        }`}
                      >
                        {template.label}
                      </p>
                      <p className="text-[11px] text-muted-foreground leading-snug">
                        {template.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </motion.section>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.15 }}
              className="flex items-center justify-between pt-6 border-t"
            >
              <p className="text-xs text-muted-foreground">
                {selectedContent !== "blank"
                  ? CONTENT_TEMPLATES.find((t) => t.id === selectedContent)?.label
                  : "Blank"}{" "}
                · {LAYOUTS.find((l) => l.id === selectedLayout)?.label}
              </p>
              <Button onClick={handleStart} className="gap-2">
                Start with this
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Right: live preview panel */}
        <div className="hidden lg:flex flex-1 items-center justify-center bg-muted/30 p-10">
          <div className="w-full max-w-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedLayout}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="rounded-2xl overflow-hidden shadow-xl border"
                style={{ height: "480px" }}
              >
                {selectedLayout === "simple" ? <SimplePreview /> : <SplitPreview />}
              </motion.div>
            </AnimatePresence>
            <motion.p
              key={selectedLayout + "-label"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="text-center text-xs text-muted-foreground mt-4"
            >
              {LAYOUTS.find((l) => l.id === selectedLayout)?.label} layout —{" "}
              {selectedLayout === "simple"
                ? "gradient background, centered opt-in card"
                : "full-bleed visual panel, form alongside"}
            </motion.p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
