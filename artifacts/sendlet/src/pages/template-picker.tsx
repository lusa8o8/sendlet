import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Image,
  Plus,
  Type,
  X,
} from "lucide-react";
import { leadMagnets } from "@/data/mock";

/* ─── Constants ────────────────────────────────────────────── */

const ACCENT = "#0F766E";

const GRADIENT_PRESETS = [
  { id: "dusk",   label: "Dusk",   value: "linear-gradient(135deg,#fdd5c4 0%,#fef0d0 42%,#d5e5ff 75%,#e5d5ff 100%)" },
  { id: "aurora", label: "Aurora", value: "linear-gradient(135deg,#c4f0e8 0%,#d5e8ff 55%,#e8d5ff 100%)" },
  { id: "bloom",  label: "Bloom",  value: "linear-gradient(135deg,#fdd5e8 0%,#fdd5c4 42%,#fef0d0 100%)" },
  { id: "slate",  label: "Slate",  value: "linear-gradient(135deg,#dde5f0 0%,#d5dff0 100%)" },
  { id: "mint",   label: "Mint",   value: "linear-gradient(135deg,#c4f0e0 0%,#c4ecff 100%)" },
];

const ACCENT_COLORS = [
  { label: "Teal",    value: "#0F766E" },
  { label: "Indigo",  value: "#4338CA" },
  { label: "Rose",    value: "#BE185D" },
  { label: "Amber",   value: "#B45309" },
  { label: "Violet",  value: "#7C3AED" },
  { label: "Sky",     value: "#0369A1" },
];

const LAYOUTS = [
  { id: "simple", label: "Simple",       desc: "Centered opt-in card on a gradient." },
  { id: "split",  label: "Visual Split", desc: "Full-bleed panel left, form right."  },
];

const LEFT_TYPES = [
  { id: "image", label: "Image",    desc: "Photo or graphic",   icon: Image },
  { id: "text",  label: "Bold text", desc: "Headline on colour", icon: Type  },
];

/* ─── Form state ────────────────────────────────────────────── */

interface Form {
  title:          string;
  description:    string;
  bullets:        string[];
  bulletsEnabled: boolean;
  ctaLabel:       string;
  accentColor:    string;
  gradientPreset: string;
  leftType:       "image" | "text";
  slug:           string;
}

const defaultForm: Form = {
  title:          "",
  description:    "",
  bullets:        ["", "", ""],
  bulletsEnabled: true,
  ctaLabel:       "Get the resource",
  accentColor:    ACCENT,
  gradientPreset: "dusk",
  leftType:       "image",
  slug:           "",
};

/* ─── Accordion ─────────────────────────────────────────────── */

function Accordion({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-3.5 text-sm font-semibold text-foreground hover:text-primary transition-colors"
      >
        {title}
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-5 space-y-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Live preview: Simple layout ──────────────────────────── */

function SimplePreview({ form }: { form: Form }) {
  const gradient = GRADIENT_PRESETS.find((g) => g.id === form.gradientPreset)?.value
    ?? GRADIENT_PRESETS[0].value;
  const accent = form.accentColor || ACCENT;
  const bullets = form.bulletsEnabled ? form.bullets.filter(Boolean) : [];
  const displayBullets = bullets.length ? bullets : ["Key benefit one", "Key benefit two", "Key benefit three"];

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center px-6 py-8"
      style={{ background: gradient }}
    >
      <div className="w-10 h-10 rounded-full bg-white shadow-md ring-4 ring-white/50 flex items-center justify-center font-semibold text-sm text-foreground mb-1.5">
        S
      </div>
      <p className="text-[11px] text-foreground/50 mb-4">Sarah Chen</p>
      <div className="w-full max-w-[280px] bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="p-5">
          <h2 className="text-sm font-bold tracking-tight mb-1 text-foreground leading-snug">
            {form.title || "Your Resource Title"}
          </h2>
          <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed">
            {form.description || "A short description of what they'll get and why it helps."}
          </p>
          {form.bulletsEnabled && (
            <div className="space-y-1.5 mb-3">
              {displayBullets.slice(0, 4).map((b, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${accent}22` }}>
                    <Check className="h-2 w-2" style={{ color: accent }} />
                  </div>
                  <span className="text-[10px] text-foreground/80">{b}</span>
                </div>
              ))}
            </div>
          )}
          <div className="border-t pt-2.5 space-y-1.5">
            <div className="h-5 rounded-md border text-[9px] text-muted-foreground flex items-center px-2">
              Enter your email address
            </div>
            <div className="h-5 rounded-md text-[9px] text-white flex items-center justify-center font-medium" style={{ backgroundColor: accent }}>
              {form.ctaLabel || "Get the resource"}
            </div>
            <p className="text-center text-[8px] text-muted-foreground">No spam. Unsubscribe anytime.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Live preview: Visual Split layout ─────────────────────── */

function SplitPreview({ form }: { form: Form }) {
  const accent = form.accentColor || ACCENT;
  const bullets = form.bulletsEnabled ? form.bullets.filter(Boolean) : [];
  const displayBullets = bullets.length ? bullets : ["Key benefit one", "Key benefit two", "Key benefit three"];

  return (
    <div className="w-full h-full flex">
      {/* Left panel */}
      <div
        className="w-[48%] h-full flex flex-col relative overflow-hidden shrink-0"
        style={{ backgroundColor: accent }}
      >
        {/* Subtle texture */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 25%, white 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {form.leftType === "image" ? (
          <div className="flex-1 flex items-center justify-center relative z-10">
            <div className="w-20 h-20 rounded-xl border-2 border-white/20 flex items-center justify-center">
              <Image className="h-7 w-7 text-white/25" />
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1" />
            <div className="relative z-10 px-6 pb-6">
              <p className="text-white font-extrabold text-xl leading-tight">
                {form.title || "Your bold headline goes here"}
              </p>
            </div>
          </>
        )}

        {/* Creator identity */}
        <div className="relative z-10 px-4 pb-4 flex items-center gap-2 shrink-0">
          <div className="w-6 h-6 rounded-full bg-white/20 ring-2 ring-white/30 flex items-center justify-center text-white font-semibold text-[10px]">
            S
          </div>
          <span className="text-white/60 text-[10px]">Sarah Chen</span>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 bg-white flex items-center overflow-hidden">
        <div className="px-5 py-5 w-full">
          <h2 className="text-sm font-bold tracking-tight mb-1 text-foreground leading-snug">
            {form.title || "Your Resource Title"}
          </h2>
          <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed">
            {form.description || "A short description of what they'll get and why it helps."}
          </p>
          {form.bulletsEnabled && (
            <div className="space-y-1.5 mb-3">
              {displayBullets.slice(0, 3).map((b, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${accent}22` }}>
                    <Check className="h-2 w-2" style={{ color: accent }} />
                  </div>
                  <span className="text-[10px] text-foreground/80">{b}</span>
                </div>
              ))}
            </div>
          )}
          <div className="border-t pt-2.5 space-y-1.5">
            <div className="h-5 rounded-md border text-[9px] text-muted-foreground flex items-center px-2">
              Enter your email address
            </div>
            <div className="h-5 rounded-md text-[9px] text-white flex items-center justify-center font-medium" style={{ backgroundColor: accent }}>
              {form.ctaLabel || "Get the resource"}
            </div>
            <p className="text-center text-[8px] text-muted-foreground">No spam. Unsubscribe anytime.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Picker panel (left, mode === 'pick') ──────────────────── */

function PickerPanel({
  layout,
  setLayout,
  form,
  setForm,
  onStart,
}: {
  layout: string;
  setLayout: (v: string) => void;
  form: Form;
  setForm: (f: Form) => void;
  onStart: () => void;
}) {
  return (
    <div className="px-8 py-8 flex flex-col h-full">
      <div className="mb-8">
        <p className="text-xs font-medium text-primary uppercase tracking-widest mb-1.5">
          New lead magnet
        </p>
        <h1 className="text-xl font-semibold tracking-tight">Choose a starting point</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Pick a layout to get started. You'll edit everything next.
        </p>
      </div>

      {/* Layout */}
      <div className="mb-7">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Layout</p>
        <div className="space-y-2.5">
          {LAYOUTS.map((l) => {
            const active = layout === l.id;
            return (
              <button
                key={l.id}
                onClick={() => setLayout(l.id)}
                className={`w-full text-left rounded-xl border-2 p-4 transition-all flex items-center gap-4 ${
                  active
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-border hover:border-foreground/20 bg-card"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    active ? "border-primary bg-primary" : "border-muted-foreground/30"
                  }`}
                >
                  {active && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <div>
                  <p className={`text-sm font-semibold ${active ? "text-primary" : "text-foreground"}`}>
                    {l.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{l.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Left panel type (only for split) */}
      <AnimatePresence>
        {layout === "split" && (
          <motion.div
            key="left-type"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden mb-7"
          >
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
              Left panel
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {LEFT_TYPES.map((t) => {
                const Icon = t.icon;
                const active = form.leftType === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setForm({ ...form, leftType: t.id as "image" | "text" })}
                    className={`text-left rounded-xl border-2 p-4 transition-all flex flex-col gap-2.5 ${
                      active
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-foreground/20 bg-card"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        active ? "bg-primary/10" : "bg-muted"
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${active ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <p className={`text-sm font-semibold leading-tight ${active ? "text-primary" : "text-foreground"}`}>
                        {t.label}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{t.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-auto pt-6 border-t flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {LAYOUTS.find((l) => l.id === layout)?.label}
          {layout === "split" ? ` · ${LEFT_TYPES.find((t) => t.id === form.leftType)?.label}` : ""}
        </p>
        <Button onClick={onStart} className="gap-2">
          Start with this
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/* ─── Editor rail (left, mode === 'edit') ───────────────────── */

function EditorRail({
  layout,
  form,
  setForm,
  onBack,
  onSave,
}: {
  layout: string;
  form: Form;
  setForm: (f: Form) => void;
  onBack: () => void;
  onSave: () => void;
}) {
  const [open, setOpen] = useState({ content: true, design: false, settings: false });
  const toggle = (k: keyof typeof open) => setOpen((o) => ({ ...o, [k]: !o[k] }));

  const setBullet = (i: number, val: string) => {
    const next = [...form.bullets];
    next[i] = val;
    setForm({ ...form, bullets: next });
  };

  const addBullet = () => setForm({ ...form, bullets: [...form.bullets, ""] });

  const removeBullet = (i: number) =>
    setForm({ ...form, bullets: form.bullets.filter((_, idx) => idx !== i) });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b flex items-center gap-3 shrink-0">
        <button
          onClick={onBack}
          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-muted-foreground" />
        </button>
        <div>
          <p className="text-xs text-muted-foreground">New lead magnet</p>
          <p className="text-sm font-semibold leading-tight">{form.title || "Untitled"}</p>
        </div>
      </div>

      {/* Accordion sections */}
      <div className="flex-1 overflow-y-auto px-6">
        {/* Content */}
        <Accordion title="Content" open={open.content} onToggle={() => toggle("content")}>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Headline</label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Your Resource Title"
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Description</label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="A short description of what they'll get and why it helps."
              className="text-sm resize-none h-20"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">Benefits</label>
              <button
                onClick={() => setForm({ ...form, bulletsEnabled: !form.bulletsEnabled })}
                className={`relative w-8 h-4 rounded-full transition-colors shrink-0 ${
                  form.bulletsEnabled ? "bg-primary" : "bg-muted-foreground/30"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${
                    form.bulletsEnabled ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
            <AnimatePresence>
              {form.bulletsEnabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-1.5 overflow-hidden"
                >
                  {form.bullets.map((b, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <Input
                        value={b}
                        onChange={(e) => setBullet(i, e.target.value)}
                        placeholder={`Benefit ${i + 1}`}
                        className="h-7 text-xs flex-1"
                      />
                      {form.bullets.length > 1 && (
                        <button
                          onClick={() => removeBullet(i)}
                          className="shrink-0 w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                  {form.bullets.length < 5 && (
                    <button
                      onClick={addBullet}
                      className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors mt-1"
                    >
                      <Plus className="h-3 w-3" /> Add benefit
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Button label</label>
            <Input
              value={form.ctaLabel}
              onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })}
              placeholder="Get the resource"
              className="h-8 text-sm"
            />
          </div>
        </Accordion>

        {/* Design */}
        <Accordion title="Design" open={open.design} onToggle={() => toggle("design")}>
          {layout === "simple" && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Background</label>
              <div className="grid grid-cols-5 gap-1.5">
                {GRADIENT_PRESETS.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setForm({ ...form, gradientPreset: g.id })}
                    title={g.label}
                    className={`h-8 rounded-lg transition-all ${
                      form.gradientPreset === g.id
                        ? "ring-2 ring-primary ring-offset-1 scale-105"
                        : "hover:scale-105 opacity-80 hover:opacity-100"
                    }`}
                    style={{ background: g.value }}
                  />
                ))}
              </div>
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Accent colour</label>
            <div className="flex gap-2 flex-wrap">
              {ACCENT_COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setForm({ ...form, accentColor: c.value })}
                  title={c.label}
                  className={`w-7 h-7 rounded-full transition-all ${
                    form.accentColor === c.value
                      ? "ring-2 ring-offset-1 ring-foreground scale-110"
                      : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
          </div>
        </Accordion>

        {/* Settings */}
        <Accordion title="Settings" open={open.settings} onToggle={() => toggle("settings")}>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Page URL</label>
            <div className="flex items-center gap-0">
              <span className="text-xs text-muted-foreground bg-muted border border-r-0 rounded-l-md px-2 h-8 flex items-center shrink-0">
                /p/
              </span>
              <Input
                value={form.slug}
                onChange={(e) =>
                  setForm({
                    ...form,
                    slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                  })
                }
                placeholder="your-resource"
                className="h-8 text-sm rounded-l-none"
              />
            </div>
          </div>
        </Accordion>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t shrink-0 flex gap-2">
        <Button variant="outline" size="sm" className="flex-1">
          Save draft
        </Button>
        <Button size="sm" className="flex-1" onClick={onSave}>
          Publish
        </Button>
      </div>
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────── */

export default function TemplatePicker() {
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<"pick" | "edit">("pick");
  const [layout, setLayout] = useState("simple");
  const [form, setForm] = useState<Form>(defaultForm);

  const handleStart = () => {
    setMode("edit");
  };

  const handleBack = () => {
    setMode("pick");
  };

  const handleSave = () => {
    const slug = form.slug || `resource-${Date.now()}`;
    const newMagnet = {
      id: String(leadMagnets.length + 1),
      title: form.title || "Untitled",
      slug,
      description: form.description,
      status: "published" as const,
      visits: 0,
      weeklyVisits: 0,
      leads: 0,
      weeklyLeads: 0,
      conversionRate: 0,
      lastLead: null,
      accentColor: form.accentColor,
      backgroundPreset: form.gradientPreset,
      layout,
      createdAt: new Date().toISOString().split("T")[0],
    };
    (leadMagnets as typeof leadMagnets & { push: (v: (typeof leadMagnets)[0]) => void }).push(newMagnet);
    setLocation("/dashboard");
  };

  const previewCaption =
    layout === "simple"
      ? "Simple layout — centered opt-in card on a gradient"
      : `Visual Split — ${form.leftType === "image" ? "photo" : "bold text"} left · form right`;

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-57px)] overflow-hidden">
        {/* Left rail */}
        <div className="w-full lg:w-[420px] xl:w-[460px] shrink-0 border-r overflow-hidden">
          <AnimatePresence mode="wait">
            {mode === "pick" ? (
              <motion.div
                key="pick"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.18 }}
                className="h-full"
              >
                <PickerPanel
                  layout={layout}
                  setLayout={setLayout}
                  form={form}
                  setForm={setForm}
                  onStart={handleStart}
                />
              </motion.div>
            ) : (
              <motion.div
                key="edit"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.18 }}
                className="h-full"
              >
                <EditorRail
                  layout={layout}
                  form={form}
                  setForm={setForm}
                  onBack={handleBack}
                  onSave={handleSave}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: live preview — always mounted, never unmounts */}
        <div className="hidden lg:flex flex-1 flex-col items-center justify-center bg-muted/30 p-10">
          <div className="w-full max-w-2xl">
            <div
              className="rounded-2xl overflow-hidden shadow-xl border"
              style={{ height: "480px" }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={layout}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="w-full h-full"
                >
                  {layout === "simple" ? (
                    <SimplePreview form={form} />
                  ) : (
                    <SplitPreview form={form} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
            <p className="text-center text-xs text-muted-foreground mt-4">{previewCaption}</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
