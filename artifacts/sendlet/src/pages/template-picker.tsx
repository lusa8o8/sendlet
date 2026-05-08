import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
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
  Image,
} from "lucide-react";
import { Link } from "wouter";

const LAYOUTS = [
  {
    id: "simple",
    label: "Simple",
    description: "Centered card on a gradient. Fast to set up, great for any text resource.",
  },
  {
    id: "split",
    label: "Visual Split",
    description: "Hero image left, opt-in form right. Ideal for graphic-heavy resources.",
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

function SimpleThumbnail() {
  return (
    <div
      className="w-full aspect-video rounded-lg overflow-hidden relative"
      style={{
        background: "linear-gradient(135deg, #fdd5c4 0%, #fef0d0 42%, #d5e5ff 75%, #e5d5ff 100%)",
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center p-5">
        <div className="w-full max-w-[70%] bg-white rounded-lg shadow-md p-3 space-y-2">
          <div className="h-2 w-3/4 bg-foreground/15 rounded-full" />
          <div className="h-1.5 w-1/2 bg-foreground/8 rounded-full" />
          <div className="space-y-1 pt-0.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#0F766E]/50 shrink-0" />
                <div className="h-1 bg-foreground/10 rounded-full flex-1" />
              </div>
            ))}
          </div>
          <div className="h-3 w-full rounded-md bg-[#0F766E]/65 mt-0.5" />
        </div>
      </div>
    </div>
  );
}

function SplitThumbnail() {
  return (
    <div className="w-full aspect-video rounded-lg overflow-hidden flex">
      <div className="w-[45%] bg-[#0C4A44] flex items-center justify-center shrink-0">
        <Image className="h-5 w-5 text-white/20" />
      </div>
      <div className="flex-1 bg-white p-3 flex flex-col justify-center space-y-1.5">
        <div className="h-2 w-4/5 bg-foreground/15 rounded-full" />
        <div className="h-1.5 w-3/5 bg-foreground/8 rounded-full" />
        <div className="space-y-1 pt-0.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#0F766E]/50 shrink-0" />
              <div className="h-1 bg-foreground/10 rounded-full flex-1" />
            </div>
          ))}
        </div>
        <div className="h-3 w-full rounded-md bg-[#0F766E]/65 mt-0.5" />
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
      <div className="container max-w-2xl mx-auto px-6 py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex items-start justify-between mb-10"
        >
          <div>
            <p className="text-xs font-medium text-primary uppercase tracking-widest mb-1.5">
              New lead magnet
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">Choose a starting point</h1>
            <p className="text-sm text-muted-foreground mt-1.5 max-w-md">
              Pick a layout, then optionally choose a content type. Everything is editable in the next step.
            </p>
          </div>
          <Button variant="ghost" size="sm" asChild className="shrink-0 mt-1 text-muted-foreground">
            <Link href="/lead-magnets/create">Skip</Link>
          </Button>
        </motion.div>

        {/* Layout section */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.05 }}
          className="mb-8"
        >
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Layout
          </p>
          <div className="grid grid-cols-2 gap-4">
            {LAYOUTS.map((layout) => {
              const isSelected = selectedLayout === layout.id;
              return (
                <button
                  key={layout.id}
                  onClick={() => setSelectedLayout(layout.id)}
                  className={`text-left rounded-xl border-2 overflow-hidden transition-all ${
                    isSelected
                      ? "border-primary ring-1 ring-primary/20 bg-card shadow-sm"
                      : "border-border hover:border-foreground/20 bg-card"
                  }`}
                >
                  <div className="p-2 bg-muted/30">
                    {layout.id === "simple" ? <SimpleThumbnail /> : <SplitThumbnail />}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm font-semibold ${isSelected ? "text-primary" : "text-foreground"}`}>
                        {layout.label}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-medium bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {layout.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.section>

        {/* Content starter section */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.1 }}
          className="mb-10"
        >
          <div className="flex items-center gap-2 mb-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Content starter
            </p>
            <span className="text-[10px] font-medium text-muted-foreground border rounded-full px-1.5 py-0.5">
              Optional
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
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
                      className={`h-3.5 w-3.5 ${isSelected ? "text-primary" : "text-muted-foreground"}`}
                    />
                  </div>
                  <p className={`text-xs font-medium mb-0.5 ${isSelected ? "text-primary" : "text-foreground"}`}>
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
              ? `Starting with ${CONTENT_TEMPLATES.find(t => t.id === selectedContent)?.label} template`
              : "Starting blank"}
            {" · "}
            {LAYOUTS.find(l => l.id === selectedLayout)?.label} layout
          </p>
          <Button onClick={handleStart} className="gap-2">
            Start with this
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </AppLayout>
  );
}
