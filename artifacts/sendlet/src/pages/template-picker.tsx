import { useState } from "react";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Download,
  ListOrdered,
  Type,
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
  {
    id: "blank",
    label: "Blank",
    icon: FileText,
    description: "Start from scratch",
  },
  {
    id: "download",
    label: "Free Download",
    icon: Download,
    description: "PDF, template, toolkit",
  },
  {
    id: "steps",
    label: "Step-by-Step",
    icon: ListOrdered,
    description: "Guide or checklist",
  },
  {
    id: "bold",
    label: "Bold Headline",
    icon: Type,
    description: "Photo-forward, punchy copy",
  },
];

const ACCENT = "#0F766E";

const CONTENT_FILLS: Record<
  string,
  { title: string; description: string; bullets: string[]; ctaLabel: string }
> = {
  blank: {
    title: "Your Resource Title",
    description: "A short description of what they'll get and why it helps.",
    bullets: ["Benefit one", "Benefit two", "Benefit three"],
    ctaLabel: "Get the resource",
  },
  download: {
    title: "The [Topic] Guide",
    description: "Everything you need to know about [topic] in one clear, free document.",
    bullets: ["Plain-English explanations", "Real-world examples", "Instant PDF download"],
    ctaLabel: "Download free",
  },
  steps: {
    title: "The [Topic] Checklist",
    description: "A simple, step-by-step process to help you [outcome] faster.",
    bullets: ["Step-by-step process", "Ready-to-use format", "Saves hours of planning"],
    ctaLabel: "Get the checklist",
  },
  bold: {
    title: "The fastest way to [outcome]",
    description: "Everything you need to [achieve result] — no fluff, no filler.",
    bullets: [],
    ctaLabel: "Get instant access",
  },
};

interface PreviewContent {
  title: string;
  description: string;
  bullets: string[];
  ctaLabel: string;
}

/* ─── Left panel variants ────────────────────────────────────── */

function LeftBlank() {
  return (
    <div className="flex-1 flex items-center justify-center relative z-10">
      <div className="w-16 h-16 rounded-xl border-2 border-white/20 flex items-center justify-center">
        <Image className="h-6 w-6 text-white/25" />
      </div>
    </div>
  );
}

function LeftDownload() {
  return (
    <div className="flex-1 flex items-center justify-center relative z-10">
      <div className="bg-white rounded-lg shadow-lg w-16 h-20 flex flex-col overflow-hidden">
        <div className="h-5 w-full flex items-center justify-center" style={{ backgroundColor: ACCENT }}>
          <span className="text-[7px] font-bold text-white uppercase tracking-wide">PDF</span>
        </div>
        <div className="flex-1 p-1.5 space-y-1">
          <div className="h-1 w-full bg-gray-200 rounded-full" />
          <div className="h-1 w-4/5 bg-gray-200 rounded-full" />
          <div className="h-1 w-3/5 bg-gray-200 rounded-full" />
          <div className="h-1 w-4/5 bg-gray-200 rounded-full" />
          <div className="h-1 w-2/3 bg-gray-200 rounded-full" />
        </div>
      </div>
    </div>
  );
}

function LeftSteps() {
  return (
    <div className="flex-1 flex items-center justify-center relative z-10">
      <div className="space-y-2">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full border-2 border-white/40 flex items-center justify-center text-white font-bold text-[10px]">
              {n}
            </div>
            <div className="h-1.5 w-14 bg-white/20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

function LeftBold() {
  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10" />
      <div className="flex-1 flex items-center justify-center relative z-10">
        <div className="w-16 h-16 rounded-xl border-2 border-white/20 flex items-center justify-center">
          <Image className="h-6 w-6 text-white/25" />
        </div>
      </div>
      <div className="relative z-20 px-5 pb-5">
        <div className="h-2 w-4/5 bg-white/70 rounded-full mb-1.5" />
        <div className="h-2 w-3/5 bg-white/50 rounded-full" />
      </div>
    </>
  );
}

/* ─── Right panel variants ───────────────────────────────────── */

function RightBlank({ content }: { content: PreviewContent }) {
  return (
    <>
      <h2 className="text-sm font-bold tracking-tight mb-1 text-foreground leading-snug">
        {content.title}
      </h2>
      <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed">
        {content.description}
      </p>
      <div className="space-y-1.5 mb-3">
        {content.bullets.map((b, i) => (
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
      <div className="border-t pt-2.5 space-y-1.5">
        <div className="h-6 rounded-md border bg-background text-[10px] text-muted-foreground flex items-center px-2.5">
          Enter your email address
        </div>
        <div
          className="h-6 rounded-md text-[10px] text-white flex items-center justify-center font-medium"
          style={{ backgroundColor: ACCENT }}
        >
          {content.ctaLabel}
        </div>
        <p className="text-center text-[9px] text-muted-foreground">
          No spam. Unsubscribe anytime.
        </p>
      </div>
    </>
  );
}

function RightDownload({ content }: { content: PreviewContent }) {
  return (
    <>
      <div
        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 mb-2 text-[9px] font-semibold uppercase tracking-wide"
        style={{ backgroundColor: `${ACCENT}15`, color: ACCENT }}
      >
        Free Resource
      </div>
      <h2 className="text-sm font-bold tracking-tight mb-1 text-foreground leading-snug">
        {content.title}
      </h2>
      <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed">
        {content.description}
      </p>
      <div className="space-y-1.5 mb-3">
        {content.bullets.map((b, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="w-5 h-4 rounded text-[8px] font-bold flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${ACCENT}15`, color: ACCENT }}
            >
              {String(i + 1).padStart(2, "0")}
            </div>
            <span className="text-[11px] text-foreground/80">{b}</span>
          </div>
        ))}
      </div>
      <div className="border-t pt-2.5 space-y-1.5">
        <div className="h-6 rounded-md border bg-background text-[10px] text-muted-foreground flex items-center px-2.5">
          Enter your email address
        </div>
        <div
          className="h-6 rounded-md text-[10px] text-white flex items-center justify-center gap-1 font-medium"
          style={{ backgroundColor: ACCENT }}
        >
          <Download className="h-2.5 w-2.5" />
          {content.ctaLabel}
        </div>
        <p className="text-center text-[9px] text-muted-foreground">
          Instant access · No credit card
        </p>
      </div>
    </>
  );
}

function RightSteps({ content }: { content: PreviewContent }) {
  return (
    <>
      <h2 className="text-sm font-bold tracking-tight mb-1 text-foreground leading-snug">
        {content.title}
      </h2>
      <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed">
        {content.description}
      </p>
      <div className="space-y-2 mb-3">
        {content.bullets.map((b, i) => (
          <div key={i} className="flex items-start gap-2">
            <div
              className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 text-[8px] font-bold mt-px"
              style={{ borderColor: ACCENT, color: ACCENT }}
            >
              {i + 1}
            </div>
            <span className="text-[11px] text-foreground/80 leading-snug">{b}</span>
          </div>
        ))}
      </div>
      <div className="border-t pt-2.5 space-y-1.5">
        <div className="h-6 rounded-md border bg-background text-[10px] text-muted-foreground flex items-center px-2.5">
          Enter your email address
        </div>
        <div
          className="h-6 rounded-md text-[10px] text-white flex items-center justify-center font-medium"
          style={{ backgroundColor: ACCENT }}
        >
          {content.ctaLabel}
        </div>
        <p className="text-center text-[9px] text-muted-foreground">
          No spam. Unsubscribe anytime.
        </p>
      </div>
    </>
  );
}

function RightBold({ content }: { content: PreviewContent }) {
  return (
    <>
      <h2 className="text-base font-extrabold tracking-tight mb-2 text-foreground leading-tight">
        {content.title}
      </h2>
      <p className="text-[11px] text-muted-foreground mb-4 leading-relaxed">
        {content.description}
      </p>
      <div className="border-t pt-3 space-y-1.5">
        <div className="h-6 rounded-md border bg-background text-[10px] text-muted-foreground flex items-center px-2.5">
          Enter your email address
        </div>
        <div
          className="h-7 rounded-md text-[10px] text-white flex items-center justify-center font-semibold tracking-wide"
          style={{ backgroundColor: ACCENT }}
        >
          {content.ctaLabel}
        </div>
        <p className="text-center text-[9px] text-muted-foreground">
          No spam. Unsubscribe anytime.
        </p>
      </div>
    </>
  );
}

/* ─── Assembled preview panels ───────────────────────────────── */

const LEFT_PANELS: Record<string, React.ReactNode> = {
  blank: <LeftBlank />,
  download: <LeftDownload />,
  steps: <LeftSteps />,
  bold: <LeftBold />,
};

function RightPanel({ variant, content }: { variant: string; content: PreviewContent }) {
  const map: Record<string, React.ReactNode> = {
    blank: <RightBlank content={content} />,
    download: <RightDownload content={content} />,
    steps: <RightSteps content={content} />,
    bold: <RightBold content={content} />,
  };
  return <>{map[variant] ?? map.blank}</>;
}

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
          <h2 className="text-sm font-bold tracking-tight mb-1 text-foreground leading-snug">
            Your Resource Title
          </h2>
          <p className="text-[11px] text-muted-foreground mb-4 leading-relaxed">
            A short description of what they'll get and why it helps.
          </p>
          <div className="space-y-2 mb-4">
            {["Benefit one", "Benefit two", "Benefit three"].map((b, i) => (
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

function SplitPreview({ variant, content }: { variant: string; content: PreviewContent }) {
  return (
    <div className="w-full h-full flex">
      {/* Left panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={variant + "-left"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="w-[50%] h-full flex flex-col justify-between p-5 relative overflow-hidden shrink-0"
          style={{ backgroundColor: ACCENT }}
        >
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 30% 20%, white 1px, transparent 1px), radial-gradient(circle at 70% 60%, white 1px, transparent 1px)",
              backgroundSize: "60px 60px, 90px 90px",
            }}
          />
          {LEFT_PANELS[variant] ?? LEFT_PANELS.blank}
          <div className="relative z-10 flex items-center gap-2 shrink-0">
            <div className="w-6 h-6 rounded-full bg-white/20 ring-2 ring-white/30 flex items-center justify-center text-white font-semibold text-[10px]">
              S
            </div>
            <span className="text-white/70 text-[10px]">Sarah Chen</span>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Right panel */}
      <div className="flex-1 bg-white flex items-center overflow-hidden">
        <div className="px-4 py-5 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={variant + "-right"}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              <RightPanel variant={variant} content={content} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */

export default function TemplatePicker() {
  const [, setLocation] = useLocation();
  const [selectedLayout, setSelectedLayout] = useState("simple");
  const [selectedContent, setSelectedContent] = useState("blank");

  const handleStart = () => {
    setLocation(`/lead-magnets/create?layout=${selectedLayout}&content=${selectedContent}`);
  };

  const activeContent = CONTENT_FILLS[selectedContent] ?? CONTENT_FILLS.blank;

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
                  {selectedLayout === "split"
                    ? "Pick a layout, then optionally pre-fill your content."
                    : "Pick a layout to get started."}
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
                      onClick={() => {
                        setSelectedLayout(layout.id);
                        if (layout.id === "simple") setSelectedContent("blank");
                      }}
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

            {/* Content starter — only for Visual Split */}
            <AnimatePresence>
              {selectedLayout === "split" && (
                <motion.section
                  key="content-starter"
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 32 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.22 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Content starter
                    </p>
                    <span className="text-[10px] font-medium text-muted-foreground border rounded-full px-1.5 py-0.5">
                      Optional
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    {CONTENT_TEMPLATES.map((template) => {
                      const Icon = template.icon;
                      const isSelected = selectedContent === template.id;
                      return (
                        <button
                          key={template.id}
                          onClick={() => setSelectedContent(template.id)}
                          className={`text-left rounded-lg border p-3 transition-all flex items-start gap-3 ${
                            isSelected
                              ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                              : "border-border hover:border-foreground/20 bg-card hover:bg-muted/30"
                          }`}
                        >
                          <div
                            className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                              isSelected ? "bg-primary/10" : "bg-muted"
                            }`}
                          >
                            <Icon
                              className={`h-3.5 w-3.5 ${
                                isSelected ? "text-primary" : "text-muted-foreground"
                              }`}
                            />
                          </div>
                          <div>
                            <p
                              className={`text-xs font-semibold ${
                                isSelected ? "text-primary" : "text-foreground"
                              }`}
                            >
                              {template.label}
                            </p>
                            <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                              {template.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.section>
              )}
            </AnimatePresence>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.15 }}
              className="flex items-center justify-between pt-6 border-t"
            >
              <p className="text-xs text-muted-foreground">
                {selectedLayout === "split" && selectedContent !== "blank"
                  ? `${CONTENT_TEMPLATES.find((t) => t.id === selectedContent)?.label} · `
                  : ""}
                {LAYOUTS.find((l) => l.id === selectedLayout)?.label} layout
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
                {selectedLayout === "simple" ? (
                  <SimplePreview />
                ) : (
                  <SplitPreview variant={selectedContent} content={activeContent} />
                )}
              </motion.div>
            </AnimatePresence>
            <motion.p
              key={selectedLayout + selectedContent}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="text-center text-xs text-muted-foreground mt-4"
            >
              {selectedLayout === "simple"
                ? "Simple layout — gradient background, centered opt-in card"
                : `${CONTENT_TEMPLATES.find((t) => t.id === selectedContent)?.label ?? "Visual Split"} — ${
                    selectedContent === "blank"
                      ? "image panel left, opt-in form right"
                      : selectedContent === "download"
                      ? "document mockup left, numbered benefits right"
                      : selectedContent === "steps"
                      ? "image panel left, numbered steps right"
                      : "photo left with caption overlay, bold headline right"
                  }`}
            </motion.p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
