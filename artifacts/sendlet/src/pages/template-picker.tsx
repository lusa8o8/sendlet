import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { useLocation, useParams } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  ArrowLeft,
  ArrowRight,
  BookmarkPlus,
  Check,
  ChevronDown,
  Image,
  Layers2,
  Link,
  Lock,
  Mail,
  Palette,
  PanelBottom,
  PanelRight,
  Plus,
  Redo2,
  Send as SendIcon,
  Settings,
  Type,
  Undo2,
  Unlock,
  Upload,
  X,
} from "lucide-react";
import { leadMagnets, saveMagnet, updateMagnet, type LeadMagnet } from "@/data/mock";
import { useAuth } from "@/contexts/auth-context";
import { saveLeadMagnetToSupabase, updateLeadMagnetInSupabase } from "@/services/sendlet-service";

/* ─── Image compression util ───────────────────────────────── */

function compressImage(file: File, maxPx = 1400, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxPx || height > maxPx) {
        if (width >= height) { height = Math.round((height / width) * maxPx); width = maxPx; }
        else { width = Math.round((width / height) * maxPx); height = maxPx; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("canvas")); return; }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = reject;
    img.src = url;
  });
}

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
  { id: "simple",    label: "Simple",       desc: "Centered opt-in card on a gradient." },
  { id: "split",     label: "Visual Split", desc: "Full-bleed panel left, form right."  },
  { id: "stacked",   label: "Stacked",      desc: "Image banner on top, form below."    },
  { id: "fullimage", label: "Full Image",   desc: "Full-bleed photo with floating glass panels." },
];

const LEFT_TYPES = [
  { id: "image", label: "Image",    desc: "Photo or graphic",   icon: Image },
  { id: "text",  label: "Bold text", desc: "Headline on colour", icon: Type  },
];

/* ─── Typography layout presets ────────────────────────────── */

type TextElEntry = Omit<TextEl, "backdrop"> & { backdrop: "none" | "glass" | "card" };
type TextElPreset = Record<Exclude<TextElKey, "tagline">, TextElEntry> & { tagline?: TextElEntry };

const LAYOUT_PRESETS: Array<{
  id: string; label: string; desc: string;
  light: TextElPreset; dark: TextElPreset;
}> = [
  {
    id: "classic", label: "Classic", desc: "Balanced proportions",
    light: {
      headline:    { x: 5, y: 6,  w: 90, size: 24, color: "#0f172a", backdrop: "none" },
      description: { x: 5, y: 26, w: 90, size: 13, color: "#475569", backdrop: "none" },
      bullets:     { x: 5, y: 45, w: 90, size: 12, color: "#374151", backdrop: "none" },
      form:        { x: 5, y: 66, w: 90, size: 12, color: "#0f172a", backdrop: "none" },
      tagline:     { x: 5, y: 65, w: 90, size: 22, color: "#ffffff", backdrop: "none" },
    },
    dark: {
      headline:    { x: 5, y: 6,  w: 90, size: 24, color: "#ffffff", backdrop: "glass" },
      description: { x: 5, y: 28, w: 90, size: 13, color: "#ffffff", backdrop: "glass" },
      bullets:     { x: 5, y: 48, w: 90, size: 12, color: "#ffffff", backdrop: "glass" },
      form:        { x: 5, y: 68, w: 90, size: 12, color: "#ffffff", backdrop: "glass" },
      tagline:     { x: 5, y: 65, w: 90, size: 22, color: "#ffffff", backdrop: "none" },
    },
  },
  {
    id: "impact", label: "Impact", desc: "Dramatic headline",
    light: {
      headline:    { x: 4, y: 4,  w: 92, size: 30, color: "#0f172a", backdrop: "none" },
      description: { x: 4, y: 30, w: 88, size: 12, color: "#64748b", backdrop: "none" },
      bullets:     { x: 4, y: 45, w: 92, size: 11, color: "#374151", backdrop: "none" },
      form:        { x: 4, y: 66, w: 92, size: 12, color: "#0f172a", backdrop: "none" },
      tagline:     { x: 4, y: 58, w: 92, size: 32, color: "#ffffff", backdrop: "none" },
    },
    dark: {
      headline:    { x: 4, y: 4,  w: 92, size: 30, color: "#ffffff", backdrop: "glass" },
      description: { x: 4, y: 32, w: 88, size: 12, color: "#ffffff", backdrop: "glass" },
      bullets:     { x: 4, y: 47, w: 92, size: 11, color: "#ffffff", backdrop: "glass" },
      form:        { x: 4, y: 67, w: 92, size: 12, color: "#ffffff", backdrop: "glass" },
      tagline:     { x: 4, y: 58, w: 92, size: 32, color: "#ffffff", backdrop: "none" },
    },
  },
  {
    id: "airy", label: "Airy", desc: "Generous spacing",
    light: {
      headline:    { x: 6, y: 8,  w: 88, size: 20, color: "#0f172a", backdrop: "none" },
      description: { x: 6, y: 27, w: 88, size: 15, color: "#334155", backdrop: "none" },
      bullets:     { x: 6, y: 52, w: 88, size: 13, color: "#374151", backdrop: "none" },
      form:        { x: 6, y: 74, w: 88, size: 12, color: "#0f172a", backdrop: "none" },
      tagline:     { x: 8, y: 62, w: 84, size: 18, color: "#ffffff", backdrop: "none" },
    },
    dark: {
      headline:    { x: 6, y: 8,  w: 88, size: 20, color: "#ffffff", backdrop: "glass" },
      description: { x: 6, y: 28, w: 88, size: 15, color: "#ffffff", backdrop: "glass" },
      bullets:     { x: 6, y: 52, w: 88, size: 13, color: "#ffffff", backdrop: "glass" },
      form:        { x: 6, y: 74, w: 88, size: 12, color: "#ffffff", backdrop: "glass" },
      tagline:     { x: 8, y: 62, w: 84, size: 18, color: "#ffffff", backdrop: "none" },
    },
  },
];

/* ─── Custom presets (localStorage) ────────────────────────── */

const CUSTOM_PRESETS_KEY = "sendlet_custom_presets";

type CustomPreset = {
  id: string;
  name: string;
  elements: Record<TextElKey, TextEl>;
};

/* ─── Touch-safe pointer helper ─────────────────────────────── */

function pointerXY(e: MouseEvent | TouchEvent): { x: number; y: number } {
  if ("touches" in e) {
    const t = e.touches[0] ?? (e as TouchEvent).changedTouches[0];
    return { x: t.clientX, y: t.clientY };
  }
  return { x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY };
}

function addDragListeners(
  onMove: (e: MouseEvent | TouchEvent) => void,
  onUp: () => void,
) {
  document.addEventListener("mousemove", onMove as EventListener);
  document.addEventListener("mouseup",   onUp);
  document.addEventListener("touchmove", onMove as EventListener, { passive: false });
  document.addEventListener("touchend",  onUp);
  document.addEventListener("touchcancel", onUp);
}

function removeDragListeners(
  onMove: (e: MouseEvent | TouchEvent) => void,
  onUp: () => void,
) {
  document.removeEventListener("mousemove", onMove as EventListener);
  document.removeEventListener("mouseup",   onUp);
  document.removeEventListener("touchmove", onMove as EventListener);
  document.removeEventListener("touchend",  onUp);
  document.removeEventListener("touchcancel", onUp);
}

/* ─── Smart snap guides ──────────────────────────────────────── */

type Guide = { axis: "h" | "v"; pct: number };

const SNAP_T = 2.5; // snap threshold in %

// Parses [#hex]word[/] inline color markers into colored <span> elements.
// Plain text outside markers keeps whatever colour is inherited from CSS.
function renderRichText(text: string): React.ReactNode {
  const regex = /\[#([0-9a-fA-F]{3,6})\]([\s\S]*?)\[\/\]/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    parts.push(<span key={match.index} style={{ color: `#${match[1]}` }}>{match[2]}</span>);
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  if (parts.length === 0) return text;
  if (parts.length === 1 && typeof parts[0] === "string") return parts[0];
  return <>{parts}</>;
}

function getProfile(): { name: string; avatar: string } {
  try {
    const raw = localStorage.getItem("sendlet_profile");
    if (raw) return JSON.parse(raw) as { name: string; avatar: string };
  } catch {}
  return { name: "Sarah Chen", avatar: "" };
}

function computeSnap(
  rawX: number,
  rawY: number,
  w: number,
  others: Array<{ x: number; y: number; w: number }>,
): { x: number; y: number; guides: Guide[] } {
  const guides: Guide[] = [];

  // Candidates for left-edge snapping (vertical guide lines)
  const vLeft   = [0, 50, ...others.map((o) => o.x)];
  // Candidates for center snapping
  const vCenter = [50, ...others.map((o) => o.x + o.w / 2)];
  // Candidates for right-edge snapping
  const vRight  = [100, ...others.map((o) => o.x + o.w)];
  // Candidates for top-edge snapping (horizontal guide lines)
  const hTop    = [0, 25, 50, 75, ...others.map((o) => o.y)];

  let snappedX = rawX;

  // Left edge
  for (const v of vLeft) {
    if (Math.abs(rawX - v) < SNAP_T) { snappedX = v; guides.push({ axis: "v", pct: v }); break; }
  }
  // Center
  if (snappedX === rawX) {
    const cx = rawX + w / 2;
    for (const v of vCenter) {
      if (Math.abs(cx - v) < SNAP_T) { snappedX = v - w / 2; guides.push({ axis: "v", pct: v }); break; }
    }
  }
  // Right edge
  if (snappedX === rawX) {
    const rx = rawX + w;
    for (const v of vRight) {
      if (Math.abs(rx - v) < SNAP_T) { snappedX = v - w; guides.push({ axis: "v", pct: v }); break; }
    }
  }

  let snappedY = rawY;
  for (const h of hTop) {
    if (Math.abs(rawY - h) < SNAP_T) { snappedY = h; guides.push({ axis: "h", pct: h }); break; }
  }

  return {
    x: Math.max(0, Math.min(85, snappedX)),
    y: Math.max(0, Math.min(80, snappedY)),
    guides,
  };
}

function GuideLines({ guides }: { guides: Guide[] }) {
  return (
    <>
      {guides.map((g, i) =>
        g.axis === "v" ? (
          <div
            key={i}
            className="absolute inset-y-0 pointer-events-none z-40"
            style={{ left: `${g.pct}%`, width: "1px", background: "rgba(14,165,233,0.85)", boxShadow: "0 0 6px rgba(14,165,233,0.5)" }}
          />
        ) : (
          <div
            key={i}
            className="absolute inset-x-0 pointer-events-none z-40"
            style={{ top: `${g.pct}%`, height: "1px", background: "rgba(14,165,233,0.85)", boxShadow: "0 0 6px rgba(14,165,233,0.5)" }}
          />
        )
      )}
    </>
  );
}

/* ─── Form state ────────────────────────────────────────────── */

interface TextEl {
  x:        number; // 0-100 % from left of right panel
  y:        number; // 0-100 % from top of right panel
  w:        number; // 0-100 % width
  size:     number; // font-size in px
  color:    string; // hex colour
  backdrop?: "none" | "glass" | "card"; // background panel style
}

type TextElKey = "headline" | "description" | "bullets" | "form" | "tagline";

interface Form {
  title:          string;
  description:    string;
  bullets:        string[];
  bulletsEnabled: boolean;
  ctaLabel:       string;
  accentColor:    string;
  gradientPreset: string;
  leftType:       "image" | "text";
  imageDataUrl:   string | null;
  slug:           string;
  textElements:   Record<TextElKey, TextEl>;
  leftPanelWidth: number;
  imagePosition:  { x: number; y: number };
  bannerHeight:   number;
  hiddenBlocks:   TextElKey[];
  tagline?:       string;
}

const defaultForm: Form = {
  title:          "",
  description:    "",
  bullets:        ["Benefit 1", "Benefit 2", "Benefit 3"],
  bulletsEnabled: true,
  ctaLabel:       "Get the resource",
  accentColor:    ACCENT,
  gradientPreset: "dusk",
  leftType:       "image",
  imageDataUrl:   null,
  slug:           "",
  leftPanelWidth: 48,
  imagePosition:  { x: 50, y: 50 },
  bannerHeight:   44,
  hiddenBlocks:   [],
  tagline:        "",
  textElements: {
    headline:    { x: 4, y: 5,  w: 92, size: 14, color: "#0f172a", backdrop: "none" },
    description: { x: 4, y: 27, w: 92, size: 11, color: "#64748b", backdrop: "none" },
    bullets:     { x: 4, y: 50, w: 92, size: 10, color: "#374151", backdrop: "none" },
    form:        { x: 4, y: 70, w: 92, size: 10, color: "#0f172a", backdrop: "none" },
    tagline:     { x: 5, y: 62, w: 90, size: 18, color: "#ffffff", backdrop: "none" },
  },
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

function SimplePreview({
  form,
  interactive = false,
  locked = false,
  onUpdateTextEl,
  onUpdate,
}: {
  form: Form;
  interactive?: boolean;
  locked?: boolean;
  onUpdateTextEl?: (key: TextElKey, u: Partial<TextEl>) => void;
  onUpdate?: (partial: Partial<Form>) => void;
}) {
  const [guides, setGuides] = useState<Guide[]>([]);
  const gradient = GRADIENT_PRESETS.find((g) => g.id === form.gradientPreset)?.value
    ?? GRADIENT_PRESETS[0].value;
  const accent = form.accentColor || ACCENT;
  const bullets = form.bulletsEnabled ? form.bullets.filter(Boolean) : [];
  const displayBullets = bullets.length ? bullets : ["Key benefit one", "Key benefit two", "Key benefit three"];
  const textElements: Record<TextElKey, TextEl> = {
    ...defaultForm.textElements,
    ...(form.textElements ?? {}),
  };
  const makeSnapMove = (dragKey: TextElKey) => (rawX: number, rawY: number, w: number) => {
    const others = (Object.entries(textElements) as [TextElKey, TextEl][])
      .filter(([k]) => k !== dragKey && !(form.hiddenBlocks ?? []).includes(k) && !(k === "bullets" && !form.bulletsEnabled))
      .map(([, o]) => ({ x: o.x, y: o.y, w: o.w }));
    const result = computeSnap(rawX, rawY, w, others);
    setGuides(result.guides);
    return result;
  };

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center px-6 py-8"
      style={{ background: gradient }}
    >
      {(() => { const p = getProfile(); return (<>
        <div className="w-10 h-10 rounded-full bg-white shadow-md ring-4 ring-white/50 flex items-center justify-center font-semibold text-sm text-foreground mb-1.5 overflow-hidden">
          {p.avatar ? <img src={p.avatar} className="w-full h-full object-cover" alt="" /> : p.name.charAt(0).toUpperCase()}
        </div>
        <p className="text-[11px] text-foreground/50 mb-4">{p.name}</p>
      </>); })()}
      <div className="w-full max-w-[280px] bg-white rounded-2xl shadow-md overflow-hidden">
        {interactive ? (
          <div className="relative" style={{ height: "290px" }}>
            <GuideLines guides={guides} />
            {!(form.hiddenBlocks ?? []).includes("headline") && (
              <DraggableTextBlock el={textElements.headline} onUpdate={(u) => onUpdateTextEl?.("headline", u)} fontClass="font-bold tracking-tight leading-snug" label="Headline" onSnapMove={makeSnapMove("headline")} onDragEnd={() => setGuides([])} onDelete={() => onUpdate?.({ hiddenBlocks: [...(form.hiddenBlocks ?? []), "headline"] })} locked={locked}>
                {renderRichText(form.title || "Your Resource Title")}
              </DraggableTextBlock>
            )}
            {!(form.hiddenBlocks ?? []).includes("description") && (
              <DraggableTextBlock el={textElements.description} onUpdate={(u) => onUpdateTextEl?.("description", u)} fontClass="leading-relaxed" label="Description" onSnapMove={makeSnapMove("description")} onDragEnd={() => setGuides([])} onDelete={() => onUpdate?.({ hiddenBlocks: [...(form.hiddenBlocks ?? []), "description"] })} locked={locked}>
                {renderRichText(form.description || "A short description of what they'll get and why it helps.")}
              </DraggableTextBlock>
            )}
            {form.bulletsEnabled && (
              <DraggableTextBlock el={textElements.bullets} onUpdate={(u) => onUpdateTextEl?.("bullets", u)} label="Benefits" onSnapMove={makeSnapMove("bullets")} onDragEnd={() => setGuides([])} onDelete={() => onUpdate?.({ bulletsEnabled: false })} locked={locked}>
                <div className="space-y-1.5">
                  {displayBullets.slice(0, 3).map((b, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${accent}22` }}>
                        <Check className="h-2 w-2" style={{ color: accent }} />
                      </div>
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </DraggableTextBlock>
            )}
            {!(form.hiddenBlocks ?? []).includes("form") && (
              <DraggableTextBlock el={textElements.form} onUpdate={(u) => onUpdateTextEl?.("form", u)} label="Form" onSnapMove={makeSnapMove("form")} onDragEnd={() => setGuides([])} onDelete={() => onUpdate?.({ hiddenBlocks: [...(form.hiddenBlocks ?? []), "form"] })} locked={locked}>
                <div className="space-y-1.5">
                  <div className="h-5 rounded-md border border-slate-200 text-[9px] text-muted-foreground flex items-center px-2 bg-white">Enter your email address</div>
                  <div className="h-5 rounded-md text-[9px] text-white flex items-center justify-center font-medium truncate px-1" style={{ backgroundColor: accent }}>{form.ctaLabel || "Get the resource"}</div>
                  <p className="text-center text-[8px] text-muted-foreground">No spam. Unsubscribe anytime.</p>
                </div>
              </DraggableTextBlock>
            )}
          </div>
        ) : (
          <div className="p-5">
            <h2 className="text-sm font-bold tracking-tight mb-1 text-foreground leading-snug">
              {renderRichText(form.title || "Your Resource Title")}
            </h2>
            <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed">
              {renderRichText(form.description || "A short description of what they'll get and why it helps.")}
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
              <div className="h-5 rounded-md border text-[9px] text-muted-foreground flex items-center px-2">Enter your email address</div>
              <div className="h-5 rounded-md text-[9px] text-white flex items-center justify-center font-medium truncate px-1" style={{ backgroundColor: accent }}>{form.ctaLabel || "Get the resource"}</div>
              <p className="text-center text-[8px] text-muted-foreground">No spam. Unsubscribe anytime.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Draggable text block (used inside interactive previews) ── */

function DraggableTextBlock({
  el,
  onUpdate,
  children,
  fontClass = "",
  label,
  onSnapMove,
  onDragStart,
  onDragEnd,
  editType,
  textValue,
  onTextChange,
  bulletValues,
  onBulletsChange,
  accentColor,
  onDelete,
  locked = false,
}: {
  el: TextEl;
  onUpdate: (u: Partial<TextEl>) => void;
  children: React.ReactNode;
  fontClass?: string;
  label: string;
  onSnapMove?: (rawX: number, rawY: number, w: number) => { x: number; y: number; guides: Guide[] };
  onDragStart?: () => void;
  onDragEnd?: () => void;
  editType?: "text" | "bullets";
  textValue?: string;
  onTextChange?: (v: string) => void;
  bulletValues?: string[];
  onBulletsChange?: (bs: string[]) => void;
  accentColor?: string;
  onDelete?: () => void;
  locked?: boolean;
}) {
  const ref             = useRef<HTMLDivElement>(null);
  const colorRef        = useRef<HTMLInputElement>(null);
  const taRef           = useRef<HTMLTextAreaElement>(null);
  const inlineColorRef    = useRef<HTMLInputElement>(null);
  const savedSelectionRef = useRef<{ start: number; end: number; text: string } | null>(null);

  const applyInlineColor = (hex: string) => {
    const ta    = taRef.current;
    const saved = savedSelectionRef.current;
    if (!ta || !saved || saved.start === saved.end) return;
    const { start, end } = saved;
    const raw         = hex.replace(/^#/, "");
    const replacement = `[#${raw}]${saved.text}[/]`;
    const next        = ta.value.slice(0, start) + replacement + ta.value.slice(end);
    savedSelectionRef.current = null; // consume snapshot — picker can only apply once per open
    onTextChange?.(next);
  };

  const stripInlineColors = () => {
    const ta = taRef.current;
    if (!ta) return;
    onTextChange?.(ta.value.replace(/\[#[0-9a-fA-F]{3,6}\]([\s\S]*?)\[\/\]/g, "$1"));
  };
  const [selected, setSelected] = useState(false);
  const [editing,  setEditing]  = useState(false);
  const dragRef    = useRef<{ mx: number; my: number; x0: number; y0: number } | null>(null);
  const resizeRef  = useRef<{ mx: number; w0: number } | null>(null);

  const startDrag = (cx: number, cy: number) => {
    setSelected(true);
    onDragStart?.();
    dragRef.current = { mx: cx, my: cy, x0: el.x, y0: el.y };
    const onMove = (me: MouseEvent | TouchEvent) => {
      if (!dragRef.current || !ref.current) return;
      if ("cancelable" in me && me.cancelable) me.preventDefault();
      const { x, y } = pointerXY(me);
      const r = ref.current.parentElement!.getBoundingClientRect();
      const dx = ((x - dragRef.current.mx) / r.width)  * 100;
      const dy = ((y - dragRef.current.my) / r.height) * 100;
      const rawX = Math.max(0, Math.min(85, dragRef.current.x0 + dx));
      const rawY = Math.max(0, Math.min(80, dragRef.current.y0 + dy));
      if (onSnapMove) {
        const { x: sx, y: sy } = onSnapMove(rawX, rawY, el.w);
        onUpdate({ x: sx, y: sy });
      } else {
        onUpdate({ x: rawX, y: rawY });
      }
    };
    const onUp = () => {
      dragRef.current = null;
      onDragEnd?.();
      removeDragListeners(onMove, onUp);
    };
    addDragListeners(onMove, onUp);
  };

  const startResize = (cx: number, cy: number) => {
    void cy;
    resizeRef.current = { mx: cx, w0: el.w };
    const onMove = (me: MouseEvent | TouchEvent) => {
      if (!resizeRef.current || !ref.current) return;
      if ("cancelable" in me && me.cancelable) me.preventDefault();
      const { x } = pointerXY(me);
      const r = ref.current.parentElement!.getBoundingClientRect();
      const dx = ((x - resizeRef.current.mx) / r.width) * 100;
      onUpdate({ w: Math.max(15, Math.min(97, resizeRef.current.w0 + dx)) });
    };
    const onUp = () => { resizeRef.current = null; removeDragListeners(onMove, onUp); };
    addDragListeners(onMove, onUp);
  };

  const enterEdit = (e: React.MouseEvent) => {
    if (!editType) return;
    e.stopPropagation();
    setSelected(true);
    setEditing(true);
  };

  const exitEdit = () => setEditing(false);

  const autoSize = (ta: HTMLTextAreaElement) => {
    ta.style.height = "auto";
    ta.style.height = ta.scrollHeight + "px";
  };

  useEffect(() => {
    if (editing && taRef.current) {
      taRef.current.focus();
      autoSize(taRef.current);
    }
  }, [editing]);

  useEffect(() => {
    if (!selected && !editing) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setSelected(false);
        setEditing(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [selected, editing]);

  const [toolbarPos, setToolbarPos] = useState<{ top: number; left: number; flipDown: boolean; flipRight: boolean } | null>(null);

  useLayoutEffect(() => {
    if (!selected || locked || !ref.current) { setToolbarPos(null); return; }
    const update = () => {
      if (!ref.current) return;
      const r = ref.current.getBoundingClientRect();
      const TOOLBAR_H = 26;
      const flipDown  = r.top < TOOLBAR_H + 8;
      const flipRight = r.right > window.innerWidth - 60;
      setToolbarPos({
        top:       flipDown ? r.bottom + 4 : r.top - TOOLBAR_H - 4,
        left:      flipRight ? r.right : r.left,
        flipDown,
        flipRight,
      });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [selected, locked, el.x, el.y, el.w]);

  const safeColor = el.color || "#0f172a";
  const ac = accentColor || ACCENT;
  const bdMode = el.backdrop ?? "none";

  const backdropInlineStyle: React.CSSProperties =
    bdMode === "glass"
      ? {
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          background: "rgba(255,255,255,0.18)",
          border: "1px solid rgba(255,255,255,0.45)",
          borderRadius: "10px",
          padding: "8px 10px",
        }
      : bdMode === "card"
      ? {
          background: "rgba(255,255,255,0.92)",
          boxShadow: "0 2px 14px rgba(0,0,0,0.10)",
          borderRadius: "10px",
          padding: "8px 10px",
        }
      : {};

  const BACKDROP_CYCLE: Array<"none" | "glass" | "card"> = ["none", "glass", "card"];
  const nextBackdrop = BACKDROP_CYCLE[(BACKDROP_CYCLE.indexOf(bdMode) + 1) % BACKDROP_CYCLE.length];
  const backdropLabel = bdMode === "glass" ? "glass" : bdMode === "card" ? "card" : "bg";

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        left: `${el.x}%`,
        top:  `${el.y}%`,
        width: `${el.w}%`,
        fontSize: `${el.size}px`,
        color: safeColor,
        touchAction: (locked || editing) ? undefined : "none",
        ...backdropInlineStyle,
      }}
      className={`group ${editing ? "cursor-text" : locked ? "cursor-default" : "cursor-move"} ${editing ? "" : "select-none"} ${fontClass} ${
        selected && !locked
          ? "outline outline-[1.5px] outline-sky-400 outline-offset-1"
          : locked
          ? "outline outline-1 outline-transparent"
          : "outline outline-1 outline-transparent hover:outline-sky-200"
      }`}
      onMouseDown={locked ? undefined : (e) => { if (editing) return; e.preventDefault(); e.stopPropagation(); startDrag(e.clientX, e.clientY); }}
      onTouchStart={locked ? undefined : (e) => { if (editing) return; e.preventDefault(); e.stopPropagation(); startDrag(e.touches[0].clientX, e.touches[0].clientY); }}
      onDoubleClick={enterEdit}
      onTouchEnd={(e) => { if (!editing && editType && e.timeStamp - ((e.target as HTMLElement).dataset.lastTap ? Number((e.target as HTMLElement).dataset.lastTap) : 0) < 350) { enterEdit(e as unknown as React.MouseEvent); } (e.target as HTMLElement).dataset.lastTap = String(e.timeStamp); }}
    >
      {/* ── Editable content ── */}
      {editing && editType === "text" ? (
        <textarea
          ref={taRef}
          value={textValue ?? ""}
          placeholder={label}
          onChange={(e) => { onTextChange?.(e.target.value); autoSize(e.target); }}
          onBlur={(e) => { if (ref.current?.contains(e.relatedTarget as Node)) return; exitEdit(); }}
          onKeyDown={(e) => { if (e.key === "Escape") { exitEdit(); } }}
          rows={1}
          className="w-full bg-transparent border-none outline-none resize-none overflow-hidden p-0 m-0 block leading-inherit"
          style={{
            fontFamily: "inherit",
            fontSize: "inherit",
            fontWeight: "inherit",
            lineHeight: "inherit",
            letterSpacing: "inherit",
            color: "inherit",
          }}
        />
      ) : editing && editType === "bullets" ? (
        <div className="space-y-1.5" onClick={(e) => e.stopPropagation()}>
          {(bulletValues ?? []).map((b, i) => (
            <div key={i} className="flex items-center gap-2 group/bullet">
              <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${ac}22` }}>
                <Check className="h-2 w-2" style={{ color: ac }} />
              </div>
              <span
                contentEditable
                suppressContentEditableWarning
                onBlur={(ev) => {
                  const next = [...(bulletValues ?? [])];
                  next[i] = ev.currentTarget.textContent ?? "";
                  onBulletsChange?.(next);
                }}
                onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }}
                className="outline-none min-w-[30px] flex-1"
              >{b}</span>
              {(bulletValues?.length ?? 0) > 1 && (
                <button
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => { e.stopPropagation(); onBulletsChange?.((bulletValues ?? []).filter((_, idx) => idx !== i)); }}
                  className="opacity-0 group-hover/bullet:opacity-100 transition-opacity text-red-400 hover:text-red-600 shrink-0"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              )}
            </div>
          ))}
          {(bulletValues?.length ?? 0) < 5 && (
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); onBulletsChange?.([...(bulletValues ?? []), "New benefit"]); }}
              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors mt-0.5"
            >
              <Plus className="h-2.5 w-2.5" /> Add benefit
            </button>
          )}
        </div>
      ) : (
        typeof children === "string" ? renderRichText(children) : children
      )}

      {/* Floating toolbar rendered via portal — escapes overflow:hidden parents */}
      {selected && !locked && toolbarPos && createPortal(
        <div
          style={{
            position: "fixed",
            top:       toolbarPos.top,
            left:      toolbarPos.flipRight ? undefined : toolbarPos.left,
            right:     toolbarPos.flipRight ? window.innerWidth - toolbarPos.left : undefined,
            zIndex:    9999,
          }}
          className="flex items-center gap-1 bg-white border border-slate-200 rounded-md shadow-md px-1.5 py-0.5 whitespace-nowrap pointer-events-auto"
          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
        >
          <span className="text-[7px] text-slate-400 font-medium pr-1 border-r border-slate-200">{label}</span>
          <button
            className="w-3.5 h-3.5 rounded-sm border border-slate-300 shrink-0 cursor-pointer"
            style={{ backgroundColor: safeColor }}
            onClick={() => colorRef.current?.click()}
            title="Text colour"
          />
          <input
            ref={colorRef}
            type="color"
            value={safeColor}
            onChange={(e) => onUpdate({ color: e.target.value })}
            className="sr-only"
          />
          <div className="flex items-center gap-0.5 border-l border-slate-200 pl-1">
            <button className="text-[9px] font-semibold text-slate-500 hover:text-slate-800 leading-none px-0.5" onClick={() => onUpdate({ size: Math.max(8, el.size - 1) })}>A−</button>
            <span className="text-[8px] font-mono text-slate-600 w-5 text-center">{el.size}</span>
            <button className="text-[9px] font-semibold text-slate-500 hover:text-slate-800 leading-none px-0.5" onClick={() => onUpdate({ size: Math.min(72, el.size + 1) })}>A+</button>
          </div>
          <button
            onClick={() => onUpdate({ backdrop: nextBackdrop })}
            className={`flex items-center gap-0.5 border-l border-slate-200 pl-1 text-[7px] font-medium transition-colors ${
              bdMode !== "none" ? "text-sky-600" : "text-slate-400 hover:text-slate-700"
            }`}
            title={`Background: ${bdMode} → click to cycle (none / glass / card)`}
          >
            <Layers2 className="h-2.5 w-2.5" />
            <span>{backdropLabel}</span>
          </button>
          {editType && (
            editing ? (
              <button onClick={exitEdit} className="text-[7px] text-emerald-600 hover:text-emerald-800 border-l border-slate-200 pl-1 font-medium">✓ done</button>
            ) : (
              <button onClick={enterEdit as unknown as React.MouseEventHandler<HTMLButtonElement>} className="text-[7px] text-sky-500 hover:text-sky-700 border-l border-slate-200 pl-1 font-medium" title="Double-click to edit text">✎ edit</button>
            )
          )}
          {editing && editType === "text" && (
            <>
              <button
                className="flex items-center gap-0.5 border-l border-slate-200 pl-1 text-[7px] font-bold text-slate-500 hover:text-slate-800"
                title="Select a word in the box, then click here to colour it"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  const ta = taRef.current;
                  if (!ta) return;
                  const start = ta.selectionStart ?? 0;
                  const end   = ta.selectionEnd   ?? 0;
                  if (start === end) return;
                  savedSelectionRef.current = { start, end, text: ta.value.slice(start, end) };
                  inlineColorRef.current?.click();
                }}
              >
                <span style={{ textDecoration: "underline", textDecorationColor: safeColor, textDecorationThickness: "2px" }}>A</span>
                <span className="text-[6px] font-normal text-slate-400">word</span>
              </button>
              <input ref={inlineColorRef} type="color" defaultValue="#ef4444" onChange={(e) => applyInlineColor(e.target.value)} className="sr-only" />
              <button
                className="text-[7px] text-slate-400 hover:text-rose-500 border-l border-slate-200 pl-1 font-medium"
                title="Strip all inline colours from this block"
                onClick={stripInlineColors}
              >−clr</button>
            </>
          )}
          {onDelete && (
            <button
              onClick={() => { setSelected(false); onDelete(); }}
              className="text-[7px] text-rose-400 hover:text-rose-600 border-l border-slate-200 pl-1 font-medium"
              title="Hide block"
            >✕ hide</button>
          )}
        </div>,
        document.body
      )}

      {/* Bottom-right resize handle — hidden while editing or locked */}
      {!editing && !locked && (
        <div
          className={`absolute -bottom-1.5 -right-1.5 w-3 h-3 rounded-sm bg-sky-400 cursor-se-resize transition-opacity ${
            selected ? "opacity-100" : "opacity-0 group-hover:opacity-60"
          }`}
          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); startResize(e.clientX, e.clientY); }}
          onTouchStart={(e) => { e.stopPropagation(); startResize(e.touches[0].clientX, e.touches[0].clientY); }}
          style={{ touchAction: "none" }}
          title="Drag to resize width"
        />
      )}
    </div>
  );
}

/* ─── Live preview: Visual Split layout ─────────────────────── */

function SplitPreview({
  form,
  interactive = false,
  locked = false,
  onUpdateTextEl,
  onUpdate,
}: {
  form: Form;
  interactive?: boolean;
  locked?: boolean;
  onUpdateTextEl?: (key: TextElKey, u: Partial<TextEl>) => void;
  onUpdate?: (partial: Partial<Form>) => void;
}) {
  const [guides, setGuides] = useState<Guide[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgFileRef   = useRef<HTMLInputElement>(null);

  const accent = form.accentColor || ACCENT;
  const bullets = form.bulletsEnabled ? form.bullets.filter(Boolean) : [];
  const displayBullets = bullets.length ? bullets : ["Benefit 1", "Benefit 2", "Benefit 3"];
  const textElements: Record<TextElKey, TextEl> = {
    ...defaultForm.textElements,
    ...(form.textElements ?? {}),
  };
  const makeSnapMove = (dragKey: TextElKey) => (rawX: number, rawY: number, w: number) => {
    const others = (Object.entries(textElements) as [TextElKey, TextEl][])
      .filter(([k]) => k !== dragKey && !(form.hiddenBlocks ?? []).includes(k) && !(k === "bullets" && !form.bulletsEnabled))
      .map(([, o]) => ({ x: o.x, y: o.y, w: o.w }));
    const result = computeSnap(rawX, rawY, w, others);
    setGuides(result.guides);
    return result;
  };
  const panelWidth = form.leftPanelWidth ?? 48;
  const imgPos     = form.imagePosition  ?? { x: 50, y: 50 };

  const startDividerDrag = (cx: number) => {
    const onMove = (me: MouseEvent | TouchEvent) => {
      if ("cancelable" in me && me.cancelable) me.preventDefault();
      if (!containerRef.current) return;
      const r = containerRef.current.getBoundingClientRect();
      const { x } = pointerXY(me);
      onUpdate?.({ leftPanelWidth: Math.max(20, Math.min(75, ((x - r.left) / r.width) * 100)) });
    };
    const onUp = () => removeDragListeners(onMove, onUp);
    addDragListeners(onMove, onUp);
  };

  const startImagePan = (cx: number, cy: number) => {
    const sx = imgPos.x; const sy = imgPos.y;
    const mx = cx; const my = cy;
    const onMove = (me: MouseEvent | TouchEvent) => {
      if ("cancelable" in me && me.cancelable) me.preventDefault();
      const { x, y } = pointerXY(me);
      onUpdate?.({ imagePosition: {
        x: Math.max(0, Math.min(100, sx - (x - mx) * 0.35)),
        y: Math.max(0, Math.min(100, sy - (y - my) * 0.35)),
      }});
    };
    const onUp = () => removeDragListeners(onMove, onUp);
    addDragListeners(onMove, onUp);
  };

  const handleImgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    e.target.value = "";
    compressImage(file).then((dataUrl) => onUpdate?.({ imageDataUrl: dataUrl }));
  };

  return (
    <div ref={containerRef} className="w-full h-full flex relative">
      {/* Left panel */}
      <div
        className="h-full flex flex-col relative overflow-hidden shrink-0"
        style={{ width: `${panelWidth}%`, backgroundColor: accent }}
      >
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle at 25% 25%, white 1px, transparent 1px)", backgroundSize: "48px 48px" }} />

        {form.leftType === "image" ? (
          form.imageDataUrl ? (
            <>
              <img
                src={form.imageDataUrl}
                alt="Panel"
                className="absolute inset-0 w-full h-full object-cover z-0 select-none"
                onMouseDown={interactive ? (e) => { e.preventDefault(); startImagePan(e.clientX, e.clientY); } : undefined}
                onTouchStart={interactive ? (e) => { startImagePan(e.touches[0].clientX, e.touches[0].clientY); } : undefined}
                style={{ objectPosition: `${imgPos.x}% ${imgPos.y}%`, cursor: interactive ? "move" : undefined, touchAction: interactive ? "none" : undefined }}
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-10 pointer-events-none" />
              <div className="flex-1 relative z-10 pointer-events-none" />
              {interactive && (
                <button
                  onClick={() => imgFileRef.current?.click()}
                  className="absolute top-2 right-2 z-20 text-[9px] bg-black/50 hover:bg-black/70 text-white rounded-md px-1.5 py-0.5 transition-colors"
                >Replace</button>
              )}
            </>
          ) : (
            <div
              className={`flex-1 flex items-center justify-center relative z-10 ${interactive ? "cursor-pointer group" : ""}`}
              onClick={interactive ? () => imgFileRef.current?.click() : undefined}
            >
              <div className={`w-20 h-20 rounded-xl border-2 border-white/20 flex flex-col items-center justify-center gap-1.5 transition-all ${interactive ? "group-hover:border-white/50 group-hover:bg-white/10" : ""}`}>
                {interactive ? (
                  <>
                    <Upload className="h-6 w-6 text-white/50 group-hover:text-white/80 transition-colors" />
                    <span className="text-[9px] text-white/50 group-hover:text-white/80 font-medium">Upload image</span>
                  </>
                ) : (
                  <Image className="h-7 w-7 text-white/25" />
                )}
              </div>
            </div>
          )
        ) : (
          <>
            <div className="flex-1" />
            {interactive
              ? !(form.hiddenBlocks ?? []).includes("tagline") && (
                  <DraggableTextBlock
                    el={textElements.tagline}
                    onUpdate={(u) => onUpdateTextEl?.("tagline", u)}
                    fontClass="font-extrabold leading-tight"
                    label="Tagline"
                    onSnapMove={(x, y, w) => computeSnap(x, y, w, [])}
                    onDragEnd={() => {}}
                    editType="text"
                    textValue={form.tagline ?? ""}
                    onTextChange={(v) => onUpdate?.({ tagline: v })}
                    onDelete={() => onUpdate?.({ hiddenBlocks: [...(form.hiddenBlocks ?? []), "tagline"] })}
                    locked={locked}
                  >
                    {form.tagline || "Your bold headline goes here"}
                  </DraggableTextBlock>
                )
              : (
                  <div className="relative z-10 px-6 pb-6">
                    <p className="text-white font-extrabold text-xl leading-tight">
                      {renderRichText(form.tagline || form.title || "Your bold headline goes here")}
                    </p>
                  </div>
                )
            }
          </>
        )}

        {/* Creator identity */}
        <div className="relative z-10 px-4 pb-4 flex items-center gap-2 shrink-0">
          {(() => { const p = getProfile(); return (<>
            <div className="w-6 h-6 rounded-full bg-white/20 ring-2 ring-white/30 flex items-center justify-center text-white font-semibold text-[10px] overflow-hidden">
              {p.avatar ? <img src={p.avatar} className="w-full h-full object-cover" alt="" /> : p.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-white/60 text-[10px]">{p.name}</span>
          </>); })()}
        </div>
      </div>

      {/* Right panel */}
      {interactive ? (
        /* ── Interactive edit mode: all four blocks draggable ── */
        <div className="flex-1 bg-white relative overflow-hidden">

          <GuideLines guides={guides} />

          {/* Headline */}
          {!(form.hiddenBlocks ?? []).includes("headline") && (
            <DraggableTextBlock
              el={textElements.headline}
              onUpdate={(u) => onUpdateTextEl?.("headline", u)}
              fontClass="font-bold tracking-tight leading-snug"
              label="Headline"
              onSnapMove={makeSnapMove("headline")}
              onDragEnd={() => setGuides([])}
              editType="text"
              textValue={form.title}
              onTextChange={(v) => onUpdate?.({ title: v })}
              onDelete={() => onUpdate?.({ hiddenBlocks: [...(form.hiddenBlocks ?? []), "headline"] })}
              locked={locked}
            >
              {renderRichText(form.title || "Your Resource Title")}
            </DraggableTextBlock>
          )}

          {/* Description */}
          {!(form.hiddenBlocks ?? []).includes("description") && (
            <DraggableTextBlock
              el={textElements.description}
              onUpdate={(u) => onUpdateTextEl?.("description", u)}
              fontClass="leading-relaxed"
              label="Description"
              onSnapMove={makeSnapMove("description")}
              onDragEnd={() => setGuides([])}
              editType="text"
              textValue={form.description}
              onTextChange={(v) => onUpdate?.({ description: v })}
              onDelete={() => onUpdate?.({ hiddenBlocks: [...(form.hiddenBlocks ?? []), "description"] })}
              locked={locked}
            >
              {renderRichText(form.description || "A short description of what they'll get and why it helps.")}
            </DraggableTextBlock>
          )}

          {/* Benefits / bullets */}
          {form.bulletsEnabled && (
            <DraggableTextBlock
              el={textElements.bullets}
              onUpdate={(u) => onUpdateTextEl?.("bullets", u)}
              label="Benefits"
              onSnapMove={makeSnapMove("bullets")}
              onDragEnd={() => setGuides([])}
              editType="bullets"
              bulletValues={displayBullets}
              onBulletsChange={(bs) => onUpdate?.({ bullets: bs })}
              accentColor={accent}
              onDelete={() => onUpdate?.({ bulletsEnabled: false })}
              locked={locked}
            >
              <div className="space-y-1.5">
                {displayBullets.slice(0, 3).map((b, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${accent}22` }}>
                      <Check className="h-2 w-2" style={{ color: accent }} />
                    </div>
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </DraggableTextBlock>
          )}

          {/* Email + CTA form block */}
          {!(form.hiddenBlocks ?? []).includes("form") && (
            <DraggableTextBlock
              el={textElements.form}
              onUpdate={(u) => onUpdateTextEl?.("form", u)}
              label="Form"
              onSnapMove={makeSnapMove("form")}
              onDragEnd={() => setGuides([])}
              onDelete={() => onUpdate?.({ hiddenBlocks: [...(form.hiddenBlocks ?? []), "form"] })}
              locked={locked}
            >
              <div className="space-y-1.5">
                <div className="h-5 rounded-md border border-slate-200 text-[9px] text-muted-foreground flex items-center px-2 bg-white">
                  Enter your email address
                </div>
                <div
                  className="h-5 rounded-md text-[9px] text-white flex items-center justify-center font-medium truncate px-1"
                  style={{ backgroundColor: accent }}
                >
                  {form.ctaLabel || "Get the resource"}
                </div>
                <p className="text-center text-[8px] text-muted-foreground">No spam. Unsubscribe anytime.</p>
              </div>
            </DraggableTextBlock>
          )}
        </div>
      ) : (
        /* ── Static pick mode ── */
        <div className="flex-1 bg-white flex items-center overflow-hidden">
          <div className="px-5 py-5 w-full">
            <h2 className="text-sm font-bold tracking-tight mb-1 text-foreground leading-snug">
              {renderRichText(form.title || "Your Resource Title")}
            </h2>
            <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed">
              {renderRichText(form.description || "A short description of what they'll get and why it helps.")}
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
              <div className="h-5 rounded-md text-[9px] text-white flex items-center justify-center font-medium truncate px-1" style={{ backgroundColor: accent }}>
                {form.ctaLabel || "Get the resource"}
              </div>
              <p className="text-center text-[8px] text-muted-foreground">No spam. Unsubscribe anytime.</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Panel-width drag divider (interactive only) ── */}
      {interactive && (
        <div
          className="absolute top-0 bottom-0 z-40 cursor-col-resize flex items-center justify-center group"
          style={{ left: `${panelWidth}%`, width: "14px", marginLeft: "-7px", touchAction: "none" }}
          onMouseDown={(e) => { e.preventDefault(); startDividerDrag(e.clientX); }}
          onTouchStart={(e) => { startDividerDrag(e.touches[0].clientX); }}
        >
          <div className="w-1 h-10 rounded-full bg-white/70 shadow group-hover:bg-white group-hover:h-14 transition-all duration-150" />
        </div>
      )}

      {/* Hidden upload input */}
      {interactive && <input ref={imgFileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleImgUpload} />}
    </div>
  );
}

/* ─── Live preview: Stacked layout ─────────────────────────── */

function StackedPreview({
  form,
  interactive = false,
  locked = false,
  onUpdateTextEl,
  onUpdate,
}: {
  form: Form;
  interactive?: boolean;
  locked?: boolean;
  onUpdateTextEl?: (key: TextElKey, u: Partial<TextEl>) => void;
  onUpdate?: (partial: Partial<Form>) => void;
}) {
  const [guides, setGuides] = useState<Guide[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgFileRef   = useRef<HTMLInputElement>(null);

  const accent = form.accentColor || ACCENT;
  const bullets = form.bulletsEnabled ? form.bullets.filter(Boolean) : [];
  const displayBullets = bullets.length ? bullets : ["Key benefit one", "Key benefit two", "Key benefit three"];
  const textElements: Record<TextElKey, TextEl> = {
    ...defaultForm.textElements,
    ...(form.textElements ?? {}),
  };
  const makeSnapMove = (dragKey: TextElKey) => (rawX: number, rawY: number, w: number) => {
    const others = (Object.entries(textElements) as [TextElKey, TextEl][])
      .filter(([k]) => k !== dragKey && !(form.hiddenBlocks ?? []).includes(k) && !(k === "bullets" && !form.bulletsEnabled))
      .map(([, o]) => ({ x: o.x, y: o.y, w: o.w }));
    const result = computeSnap(rawX, rawY, w, others);
    setGuides(result.guides);
    return result;
  };
  const bannerH = form.bannerHeight ?? 44;
  const imgPos  = form.imagePosition ?? { x: 50, y: 50 };

  const startBannerDrag = () => {
    const onMove = (me: MouseEvent | TouchEvent) => {
      if ("cancelable" in me && me.cancelable) me.preventDefault();
      if (!containerRef.current) return;
      const r = containerRef.current.getBoundingClientRect();
      const { y } = pointerXY(me);
      onUpdate?.({ bannerHeight: Math.max(25, Math.min(70, ((y - r.top) / r.height) * 100)) });
    };
    const onUp = () => removeDragListeners(onMove, onUp);
    addDragListeners(onMove, onUp);
  };

  const startImagePan = (cx: number, cy: number) => {
    const sx = imgPos.x; const sy = imgPos.y;
    const mx = cx; const my = cy;
    const onMove = (me: MouseEvent | TouchEvent) => {
      if ("cancelable" in me && me.cancelable) me.preventDefault();
      const { x, y } = pointerXY(me);
      onUpdate?.({ imagePosition: {
        x: Math.max(0, Math.min(100, sx - (x - mx) * 0.35)),
        y: Math.max(0, Math.min(100, sy - (y - my) * 0.35)),
      }});
    };
    const onUp = () => removeDragListeners(onMove, onUp);
    addDragListeners(onMove, onUp);
  };

  const handleImgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    e.target.value = "";
    compressImage(file).then((dataUrl) => onUpdate?.({ imageDataUrl: dataUrl }));
  };

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col bg-white">
      {/* Top: image banner */}
      <div
        className="relative shrink-0 overflow-hidden"
        style={{ height: `${bannerH}%`, backgroundColor: accent }}
      >
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(circle at 25% 25%, white 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {form.leftType !== "text" ? (
          form.imageDataUrl ? (
            <>
              <img
                src={form.imageDataUrl}
                alt="Banner"
                className="absolute inset-0 w-full h-full object-cover select-none"
                onMouseDown={interactive ? (e) => { e.preventDefault(); startImagePan(e.clientX, e.clientY); } : undefined}
                onTouchStart={interactive ? (e) => { startImagePan(e.touches[0].clientX, e.touches[0].clientY); } : undefined}
                style={{ objectPosition: `${imgPos.x}% ${imgPos.y}%`, cursor: interactive ? "move" : undefined, touchAction: interactive ? "none" : undefined }}
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/25 pointer-events-none" />
              {interactive && (
                <button
                  onClick={() => imgFileRef.current?.click()}
                  className="absolute top-2 right-2 z-20 text-[9px] bg-black/50 hover:bg-black/70 text-white rounded-md px-1.5 py-0.5 transition-colors"
                >Replace</button>
              )}
            </>
          ) : (
            <div
              className={`absolute inset-0 flex items-center justify-center ${interactive ? "cursor-pointer group" : ""}`}
              onClick={interactive ? () => imgFileRef.current?.click() : undefined}
            >
              <div className={`w-16 h-16 rounded-xl border-2 border-white/20 flex flex-col items-center justify-center gap-1.5 transition-all ${interactive ? "group-hover:border-white/50 group-hover:bg-white/10" : ""}`}>
                {interactive ? (
                  <>
                    <Upload className="h-5 w-5 text-white/50 group-hover:text-white/80 transition-colors" />
                    <span className="text-[9px] text-white/50 group-hover:text-white/80 font-medium">Upload image</span>
                  </>
                ) : (
                  <Image className="h-6 w-6 text-white/25" />
                )}
              </div>
            </div>
          )
        ) : null}
        {interactive
          ? !(form.hiddenBlocks ?? []).includes("tagline") && (
              <DraggableTextBlock
                el={textElements.tagline}
                onUpdate={(u) => onUpdateTextEl?.("tagline", u)}
                fontClass="font-extrabold leading-tight"
                label="Tagline"
                onSnapMove={(x, y, w) => computeSnap(x, y, w, [])}
                onDragEnd={() => {}}
                editType="text"
                textValue={form.tagline ?? ""}
                onTextChange={(v) => onUpdate?.({ tagline: v })}
                onDelete={() => onUpdate?.({ hiddenBlocks: [...(form.hiddenBlocks ?? []), "tagline"] })}
                locked={locked}
              >
                {form.tagline || "Your bold headline goes here"}
              </DraggableTextBlock>
            )
          : form.tagline && !(form.hiddenBlocks ?? []).includes("tagline") && (
              <div className="absolute z-10 bottom-14 left-4 right-4">
                <p className="text-white font-extrabold text-lg leading-tight drop-shadow">{renderRichText(form.tagline)}</p>
              </div>
            )
        }
        <div className="absolute bottom-3 left-4 flex items-center gap-1.5 z-10">
          {(() => { const p = getProfile(); return (<>
            <div className="w-6 h-6 rounded-full bg-white/90 shadow flex items-center justify-center font-semibold text-foreground text-[9px] overflow-hidden">
              {p.avatar ? <img src={p.avatar} className="w-full h-full object-cover" alt="" /> : p.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-[10px] font-medium drop-shadow" style={{ color: form.imageDataUrl ? "white" : "rgba(255,255,255,0.7)" }}>{p.name}</span>
          </>); })()}
        </div>
        {/* Banner height drag handle */}
        {interactive && (
          <div
            className="absolute bottom-0 left-0 right-0 z-20 cursor-row-resize flex justify-center items-end pb-0.5"
            style={{ height: "12px", touchAction: "none" }}
            onMouseDown={(e) => { e.preventDefault(); startBannerDrag(); }}
            onTouchStart={() => { startBannerDrag(); }}
          >
            <div className="w-10 h-1 rounded-full bg-white/50 group-hover:bg-white transition-all duration-150" />
          </div>
        )}
      </div>
      {interactive && <input ref={imgFileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleImgUpload} />}

      {/* Bottom: drag surface in edit mode, static otherwise */}
      {interactive ? (
        <div className="flex-1 relative overflow-hidden bg-white">
          <GuideLines guides={guides} />
          {!(form.hiddenBlocks ?? []).includes("headline") && (
            <DraggableTextBlock el={textElements.headline} onUpdate={(u) => onUpdateTextEl?.("headline", u)} fontClass="font-bold tracking-tight leading-snug" label="Headline" onSnapMove={makeSnapMove("headline")} onDragEnd={() => setGuides([])} editType="text" textValue={form.title} onTextChange={(v) => onUpdate?.({ title: v })} onDelete={() => onUpdate?.({ hiddenBlocks: [...(form.hiddenBlocks ?? []), "headline"] })} locked={locked}>
              {renderRichText(form.title || "Your Resource Title")}
            </DraggableTextBlock>
          )}
          {!(form.hiddenBlocks ?? []).includes("description") && (
            <DraggableTextBlock el={textElements.description} onUpdate={(u) => onUpdateTextEl?.("description", u)} fontClass="leading-relaxed" label="Description" onSnapMove={makeSnapMove("description")} onDragEnd={() => setGuides([])} editType="text" textValue={form.description} onTextChange={(v) => onUpdate?.({ description: v })} onDelete={() => onUpdate?.({ hiddenBlocks: [...(form.hiddenBlocks ?? []), "description"] })} locked={locked}>
              {renderRichText(form.description || "A short description of what they'll get and why it helps.")}
            </DraggableTextBlock>
          )}
          {form.bulletsEnabled && (
            <DraggableTextBlock el={textElements.bullets} onUpdate={(u) => onUpdateTextEl?.("bullets", u)} label="Benefits" onSnapMove={makeSnapMove("bullets")} onDragEnd={() => setGuides([])} editType="bullets" bulletValues={displayBullets} onBulletsChange={(bs) => onUpdate?.({ bullets: bs })} accentColor={accent} onDelete={() => onUpdate?.({ bulletsEnabled: false })} locked={locked}>
              <div className="space-y-1.5">
                {displayBullets.slice(0, 3).map((b, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${accent}22` }}>
                      <Check className="h-2 w-2" style={{ color: accent }} />
                    </div>
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </DraggableTextBlock>
          )}
          {!(form.hiddenBlocks ?? []).includes("form") && (
            <DraggableTextBlock el={textElements.form} onUpdate={(u) => onUpdateTextEl?.("form", u)} label="Form" onSnapMove={makeSnapMove("form")} onDragEnd={() => setGuides([])} onDelete={() => onUpdate?.({ hiddenBlocks: [...(form.hiddenBlocks ?? []), "form"] })} locked={locked}>
              <div className="space-y-1.5">
                <div className="h-5 rounded-md border border-slate-200 text-[9px] text-muted-foreground flex items-center px-2 bg-white">Enter your email address</div>
                <div className="h-5 rounded-md text-[9px] text-white flex items-center justify-center font-medium truncate px-1" style={{ backgroundColor: accent }}>{form.ctaLabel || "Get the resource"}</div>
                <p className="text-center text-[8px] text-muted-foreground">No spam. Unsubscribe anytime.</p>
              </div>
            </DraggableTextBlock>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-hidden px-5 py-4 flex flex-col justify-center">
          <h2 className="text-sm font-bold tracking-tight mb-1 text-foreground leading-snug">
            {renderRichText(form.title || "Your Resource Title")}
          </h2>
          <p className="text-[11px] text-muted-foreground mb-2.5 leading-relaxed">
            {renderRichText(form.description || "A short description of what they'll get and why it helps.")}
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
            <div className="h-5 rounded-md border text-[9px] text-muted-foreground flex items-center px-2">Enter your email address</div>
            <div className="h-5 rounded-md text-[9px] text-white flex items-center justify-center font-medium truncate px-1" style={{ backgroundColor: accent }}>{form.ctaLabel || "Get the resource"}</div>
            <p className="text-center text-[8px] text-muted-foreground">No spam. Unsubscribe anytime.</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Live preview: Full Image layout ───────────────────────── */

function FullImagePreview({
  form,
  interactive = false,
  locked = false,
  onUpdateTextEl,
  onUpdate,
}: {
  form: Form;
  interactive?: boolean;
  locked?: boolean;
  onUpdateTextEl?: (key: TextElKey, u: Partial<TextEl>) => void;
  onUpdate?: (partial: Partial<Form>) => void;
}) {
  const [guides, setGuides] = useState<Guide[]>([]);
  const imgFileRef = useRef<HTMLInputElement>(null);
  const accent = form.accentColor || ACCENT;
  const bullets = form.bulletsEnabled ? form.bullets.filter(Boolean) : [];
  const displayBullets = bullets.length ? bullets : ["Key benefit one", "Key benefit two", "Key benefit three"];
  const textElements: Record<TextElKey, TextEl> = {
    ...defaultForm.textElements,
    ...(form.textElements ?? {}),
  };
  const makeSnapMove = (dragKey: TextElKey) => (rawX: number, rawY: number, w: number) => {
    const others = (Object.entries(textElements) as [TextElKey, TextEl][])
      .filter(([k]) => k !== dragKey && !(form.hiddenBlocks ?? []).includes(k) && !(k === "bullets" && !form.bulletsEnabled))
      .map(([, o]) => ({ x: o.x, y: o.y, w: o.w }));
    const result = computeSnap(rawX, rawY, w, others);
    setGuides(result.guides);
    return result;
  };

  const bgStyle: React.CSSProperties = form.imageDataUrl
    ? {
        backgroundImage: `url(${form.imageDataUrl})`,
        backgroundSize: "cover",
        backgroundPosition: `${form.imagePosition?.x ?? 50}% ${form.imagePosition?.y ?? 50}%`,
      }
    : { background: "linear-gradient(135deg,#1e293b 0%,#0f4c44 50%,#1e293b 100%)" };

  const glassPanel: React.CSSProperties = {
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    background: "rgba(255,255,255,0.16)",
    border: "1px solid rgba(255,255,255,0.38)",
    borderRadius: "10px",
    padding: "8px 12px",
  };

  return (
    <div className="w-full h-full relative overflow-hidden" style={bgStyle}>
      {/* Subtle dark veil for contrast */}
      <div className="absolute inset-0 bg-black/25 pointer-events-none z-0" />

      {interactive ? (
        <div className="absolute inset-0">
          {/* Upload / Replace button */}
          <button
            className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-black/40 hover:bg-black/60 rounded-lg px-2.5 py-1.5 transition-colors"
            onClick={() => imgFileRef.current?.click()}
          >
            <Upload className="h-3 w-3 text-white" />
            <span className="text-[10px] text-white font-medium">
              {form.imageDataUrl ? "Replace" : "Upload image"}
            </span>
          </button>
          <input
            ref={imgFileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              e.target.value = "";
              compressImage(file).then((dataUrl) => onUpdate?.({ imageDataUrl: dataUrl }));
            }}
          />

          <GuideLines guides={guides} />

          {/* Draggable blocks */}
          {!(form.hiddenBlocks ?? []).includes("headline") && (
            <DraggableTextBlock
              el={textElements.headline}
              onUpdate={(u) => onUpdateTextEl?.("headline", u)}
              fontClass="font-bold tracking-tight leading-snug"
              label="Headline"
              onSnapMove={makeSnapMove("headline")}
              onDragEnd={() => setGuides([])}
              editType="text"
              textValue={form.title}
              onTextChange={(v) => onUpdate?.({ title: v })}
              onDelete={() => onUpdate?.({ hiddenBlocks: [...(form.hiddenBlocks ?? []), "headline"] })}
              locked={locked}
            >
              {renderRichText(form.title || "Your Resource Title")}
            </DraggableTextBlock>
          )}

          {!(form.hiddenBlocks ?? []).includes("description") && (
            <DraggableTextBlock
              el={textElements.description}
              onUpdate={(u) => onUpdateTextEl?.("description", u)}
              fontClass="leading-relaxed"
              label="Description"
              onSnapMove={makeSnapMove("description")}
              onDragEnd={() => setGuides([])}
              editType="text"
              textValue={form.description}
              onTextChange={(v) => onUpdate?.({ description: v })}
              onDelete={() => onUpdate?.({ hiddenBlocks: [...(form.hiddenBlocks ?? []), "description"] })}
              locked={locked}
            >
              {renderRichText(form.description || "A short description of what they'll get and why it helps.")}
            </DraggableTextBlock>
          )}

          {form.bulletsEnabled && (
            <DraggableTextBlock
              el={textElements.bullets}
              onUpdate={(u) => onUpdateTextEl?.("bullets", u)}
              label="Benefits"
              onSnapMove={makeSnapMove("bullets")}
              onDragEnd={() => setGuides([])}
              editType="bullets"
              bulletValues={displayBullets}
              onBulletsChange={(bs) => onUpdate?.({ bullets: bs })}
              accentColor={accent}
              onDelete={() => onUpdate?.({ bulletsEnabled: false })}
              locked={locked}
            >
              <div className="space-y-1.5">
                {displayBullets.slice(0, 3).map((b, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${accent}55` }}>
                      <Check className="h-2 w-2 text-white" />
                    </div>
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </DraggableTextBlock>
          )}

          {!(form.hiddenBlocks ?? []).includes("form") && (
            <DraggableTextBlock
              el={textElements.form}
              onUpdate={(u) => onUpdateTextEl?.("form", u)}
              label="Form"
              onSnapMove={makeSnapMove("form")}
              onDragEnd={() => setGuides([])}
              onDelete={() => onUpdate?.({ hiddenBlocks: [...(form.hiddenBlocks ?? []), "form"] })}
              locked={locked}
            >
              <div className="space-y-1.5">
                <div className="h-5 rounded-md border border-white/30 text-[9px] text-white/70 flex items-center px-2 bg-white/10">
                  Enter your email address
                </div>
                <div className="h-5 rounded-md text-[9px] text-white flex items-center justify-center font-medium truncate px-1" style={{ backgroundColor: accent }}>
                  {form.ctaLabel || "Get the resource"}
                </div>
                <p className="text-center text-[8px] text-white/60">No spam. Unsubscribe anytime.</p>
              </div>
            </DraggableTextBlock>
          )}
        </div>
      ) : (
        /* ── Static pick mode — glass panels preview ── */
        <div className="w-full h-full relative z-10">
          <div className="absolute" style={{ left: "5%", top: "8%", width: "90%" }}>
            <div style={glassPanel}>
              <p className="text-sm font-bold text-white leading-snug">
                {renderRichText(form.title || "Your Resource Title")}
              </p>
            </div>
          </div>

          <div className="absolute" style={{ left: "5%", top: "26%", width: "90%" }}>
            <div style={glassPanel}>
              <p className="text-[11px] text-white/85 leading-relaxed">
                {renderRichText(form.description || "A short description of what they'll get and why it helps.")}
              </p>
            </div>
          </div>

          {form.bulletsEnabled && (
            <div className="absolute" style={{ left: "5%", top: "44%", width: "90%" }}>
              <div style={glassPanel}>
                <div className="space-y-1.5">
                  {displayBullets.slice(0, 3).map((b, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${accent}55` }}>
                        <Check className="h-2 w-2 text-white" />
                      </div>
                      <span className="text-[10px] text-white/90">{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="absolute" style={{ left: "5%", top: form.bulletsEnabled ? "67%" : "50%", width: "90%" }}>
            <div style={{ ...glassPanel, padding: "8px 12px" }} className="space-y-1.5">
              <div className="h-5 rounded-md border border-white/30 text-[9px] text-white/70 flex items-center px-2 bg-white/10">
                Enter your email address
              </div>
              <div className="h-5 rounded-md text-[9px] text-white flex items-center justify-center font-medium truncate px-1" style={{ backgroundColor: accent }}>
                {form.ctaLabel || "Get the resource"}
              </div>
              <p className="text-center text-[8px] text-white/60">No spam. Unsubscribe anytime.</p>
            </div>
          </div>
        </div>
      )}
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
    <div className="px-8 py-8 flex flex-col min-h-full">
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

      {/* Left panel / banner type (split and stacked) */}
      <AnimatePresence>
        {(layout === "split" || layout === "stacked") && (
          <motion.div
            key="left-type"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden mb-7"
          >
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
              {layout === "stacked" ? "Banner" : "Left panel"}
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
          {(layout === "split" || layout === "stacked") ? ` · ${LEFT_TYPES.find((t) => t.id === form.leftType)?.label}` : ""}
        </p>
        <Button onClick={onStart} className="gap-2">
          Start with this
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/* ─── Floating editor bar (mode === 'edit') ─────────────────── */

function BarBtn({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  icon: React.ElementType;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
        active
          ? "bg-primary/10 text-primary"
          : "text-foreground/60 hover:text-foreground hover:bg-muted"
      }`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      {label}
    </button>
  );
}

function FloatingBar({
  layout,
  form,
  setForm,
  onBack,
  onSave,
  isEditing,
  barPosition = "bottom",
  onTogglePosition,
  locked = false,
  onToggleLock,
  onApplyPreset,
  activePreset,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  customPresets = [],
  onSavePreset,
  onDeleteCustomPreset,
  onApplyCustomPreset,
}: {
  layout: string;
  form: Form;
  setForm: (f: Form) => void;
  onBack: () => void;
  onSave: () => void;
  isEditing?: boolean;
  barPosition?: "bottom" | "side";
  onTogglePosition?: () => void;
  locked?: boolean;
  onToggleLock?: () => void;
  onApplyPreset?: (p: typeof LAYOUT_PRESETS[0]) => void;
  activePreset?: string | null;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  customPresets?: CustomPreset[];
  onSavePreset?: (name: string) => void;
  onDeleteCustomPreset?: (id: string) => void;
  onApplyCustomPreset?: (p: CustomPreset) => void;
}) {
  const [panel, setPanel] = useState<string | null>(null);
  const [savingPreset, setSavingPreset] = useState(false);
  const [presetName, setPresetName] = useState("");
  const presetInputRef = useRef<HTMLInputElement>(null);
  const toggle = (p: string) => setPanel((cur) => (cur === p ? null : p));

  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 640);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    e.target.value = "";
    compressImage(file).then((dataUrl) => setForm({ ...form, imageDataUrl: dataUrl }));
  };
  const setBullet = (i: number, val: string) => { const next = [...form.bullets]; next[i] = val; setForm({ ...form, bullets: next }); };
  const addBullet = () => setForm({ ...form, bullets: [...form.bullets, ""] });
  const removeBullet = (i: number) => setForm({ ...form, bullets: form.bullets.filter((_, idx) => idx !== i) });
  const restoreBlock = (key: TextElKey) => setForm({
    ...form,
    hiddenBlocks: (form.hiddenBlocks ?? []).filter((k) => k !== key),
    ...(key === "bullets" ? { bulletsEnabled: true } : {}),
  });

  const hiddenKeys = form.hiddenBlocks ?? [];
  const restorableKeys: TextElKey[] = (["headline", "description", "form"] as TextElKey[]).filter((k) => hiddenKeys.includes(k));
  if (!form.bulletsEnabled) restorableKeys.push("bullets" as TextElKey);
  if ((layout === "split" || layout === "stacked") && hiddenKeys.includes("tagline")) restorableKeys.push("tagline" as TextElKey);

  const isSide = barPosition === "side";
  const popSide = isSide ? ("left" as const) : ("top" as const);
  const sep = <div className="w-px h-5 bg-border/70 mx-0.5 shrink-0" />;

  /* ── Shared popover panel content ── */
  const imagePanel = (
    <PopoverContent side={popSide} align="center" sideOffset={10} className="w-64 p-4 space-y-3">
      <p className="text-xs font-semibold text-foreground">
        {layout === "stacked" ? "Banner" : layout === "split" ? "Panel" : "Cover image"}
      </p>
      {(layout === "split" || layout === "stacked") && (
        <div className="grid grid-cols-2 gap-1.5">
          {LEFT_TYPES.map((t) => {
            const active = form.leftType === t.id;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setForm({ ...form, leftType: t.id as "image" | "text" })}
                className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-left transition-all ${active ? "border-primary bg-primary/5" : "border-border hover:border-foreground/20"}`}
              >
                <Icon className={`h-3.5 w-3.5 shrink-0 ${active ? "text-primary" : "text-muted-foreground"}`} />
                <div>
                  <p className={`text-xs font-semibold leading-none ${active ? "text-primary" : "text-foreground"}`}>{t.label}</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5 leading-tight">{t.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
      {(layout !== "split" && layout !== "stacked" || form.leftType === "image") && (
        form.imageDataUrl ? (
          <div className="relative rounded-lg overflow-hidden border" style={{ aspectRatio: "4/3" }}>
            <img src={form.imageDataUrl} alt="Panel" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <button onClick={() => setForm({ ...form, imageDataUrl: null })} className="absolute top-2 right-2 w-6 h-6 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors">
              <X className="h-3 w-3 text-white" />
            </button>
            <label className="absolute bottom-2 right-2 text-[10px] bg-black/50 hover:bg-black/70 text-white rounded-md px-2 py-1 transition-colors cursor-pointer">
              Replace
              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={handleImageUpload} />
            </label>
          </div>
        ) : (
          <label className="w-full border-2 border-dashed border-border rounded-lg p-4 flex flex-col items-center gap-2 hover:border-primary/40 hover:bg-primary/5 transition-all group cursor-pointer">
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={handleImageUpload} />
            <div className="w-8 h-8 rounded-lg bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
              <Upload className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="text-center">
              <p className="text-xs font-medium">Click to upload</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">JPG, PNG, WebP</p>
            </div>
          </label>
        )
      )}
    </PopoverContent>
  );

  const contentPanel = (
    <PopoverContent side={popSide} align="center" sideOffset={10} className="w-72 p-4 space-y-3 max-h-[420px] overflow-y-auto">
      <p className="text-xs font-semibold text-foreground">Content</p>
      <div className="space-y-1">
        <label className="text-[11px] font-medium text-muted-foreground">Headline</label>
        <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Your Resource Title" className="h-8 text-sm" />
      </div>
      {(layout === "split" || layout === "stacked") && (
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-muted-foreground">Image tagline</label>
          <Input value={form.tagline ?? ""} onChange={(e) => setForm({ ...form, tagline: e.target.value })} placeholder="Bold text over the image…" className="h-8 text-sm" />
        </div>
      )}
      <div className="space-y-1">
        <label className="text-[11px] font-medium text-muted-foreground">Description</label>
        <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="A short description..." className="text-sm resize-none h-16" />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-medium text-muted-foreground">Benefits</label>
          <button onClick={() => setForm({ ...form, bulletsEnabled: !form.bulletsEnabled })} className={`relative w-8 h-4 rounded-full transition-colors shrink-0 ${form.bulletsEnabled ? "bg-primary" : "bg-muted-foreground/30"}`}>
            <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${form.bulletsEnabled ? "translate-x-4" : "translate-x-0.5"}`} />
          </button>
        </div>
        {form.bulletsEnabled && (
          <div className="space-y-1.5">
            {form.bullets.map((b, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <Input value={b} onChange={(e) => setBullet(i, e.target.value)} placeholder={`Benefit ${i + 1}`} className="h-7 text-xs flex-1" />
                {form.bullets.length > 1 && (
                  <button onClick={() => removeBullet(i)} className="shrink-0 w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
            {form.bullets.length < 5 && (
              <button onClick={addBullet} className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors">
                <Plus className="h-3 w-3" /> Add benefit
              </button>
            )}
          </div>
        )}
      </div>
      <div className="space-y-1">
        <label className="text-[11px] font-medium text-muted-foreground">Button label</label>
        <Input value={form.ctaLabel} onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })} placeholder="Get the resource" className="h-8 text-sm" />
      </div>
      {restorableKeys.length > 0 && (
        <div className="border-t pt-2 space-y-0.5">
          <p className="text-[11px] font-medium text-muted-foreground mb-1">Hidden blocks</p>
          {restorableKeys.map((key) => (
            <button key={key} onClick={() => restoreBlock(key)} className="flex items-center gap-1.5 w-full text-[11px] text-muted-foreground hover:text-primary hover:bg-primary/5 rounded px-1.5 py-1 transition-colors">
              <Plus className="h-3 w-3 shrink-0" />
              Restore {key === "form" ? "Form block" : key === "bullets" ? "Benefits" : key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>
      )}
    </PopoverContent>
  );

  const designPanel = (
    <PopoverContent side={popSide} align="center" sideOffset={10} className="w-64 p-4 space-y-4">
      <p className="text-xs font-semibold text-foreground">Design</p>

      {/* Typography presets */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-medium text-muted-foreground">Typography preset</label>
          <button
            onClick={onToggleLock}
            title={locked ? "Locked — click to unlock" : "Unlocked — click to lock"}
            className={`flex items-center gap-0.5 text-[9px] font-medium rounded-md px-1.5 py-0.5 transition-colors ${locked ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
          >
            {locked ? <Lock className="h-2.5 w-2.5" /> : <Unlock className="h-2.5 w-2.5" />}
            {locked ? "Locked" : "Unlocked"}
          </button>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {LAYOUT_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => onApplyPreset?.(p)}
              className={`flex flex-col items-start gap-0.5 p-2 rounded-lg border text-left transition-all ${
                activePreset === p.id
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border hover:border-primary/40 hover:bg-muted/50"
              }`}
            >
              <span className="text-[10px] font-semibold leading-none">{p.label}</span>
              <span className="text-[9px] text-muted-foreground leading-tight">{p.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {layout === "simple" && (
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-muted-foreground">Background</label>
          <div className="grid grid-cols-5 gap-1.5">
            {GRADIENT_PRESETS.map((g) => (
              <button key={g.id} onClick={() => setForm({ ...form, gradientPreset: g.id })} title={g.label} className={`h-8 rounded-lg transition-all ${form.gradientPreset === g.id ? "ring-2 ring-primary ring-offset-1 scale-105" : "hover:scale-105 opacity-80 hover:opacity-100"}`} style={{ background: g.value }} />
            ))}
          </div>
        </div>
      )}
      <div className="space-y-1.5">
        <label className="text-[11px] font-medium text-muted-foreground">Accent colour</label>
        <div className="flex gap-2 flex-wrap">
          {ACCENT_COLORS.map((c) => (
            <button key={c.value} onClick={() => setForm({ ...form, accentColor: c.value })} title={c.label} className={`w-7 h-7 rounded-full transition-all ${form.accentColor === c.value ? "ring-2 ring-offset-1 ring-foreground scale-110" : "hover:scale-105"}`} style={{ backgroundColor: c.value }} />
          ))}
        </div>
      </div>

      {/* Custom presets */}
      {customPresets.length > 0 && (
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-muted-foreground">Your presets</label>
          <div className="space-y-1">
            {customPresets.map((p) => (
              <div key={p.id} className={`flex items-center gap-1 rounded-lg border px-2 py-1.5 transition-all ${activePreset === p.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30 hover:bg-muted/40"}`}>
                <button onClick={() => onApplyCustomPreset?.(p)} className="flex-1 text-left text-[11px] font-medium text-foreground truncate">
                  {p.name}
                </button>
                <button onClick={() => onDeleteCustomPreset?.(p.id)} className="shrink-0 w-4 h-4 rounded flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors">
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save current layout as preset */}
      <div className="border-t pt-3 space-y-1.5">
        {!savingPreset ? (
          <button
            onClick={() => { setSavingPreset(true); setPresetName(""); setTimeout(() => presetInputRef.current?.focus(), 50); }}
            className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-primary transition-colors"
          >
            <BookmarkPlus className="h-3 w-3" />
            Save current layout as preset
          </button>
        ) : (
          <div className="flex gap-1.5">
            <input
              ref={presetInputRef}
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && presetName.trim()) { onSavePreset?.(presetName.trim()); setSavingPreset(false); }
                if (e.key === "Escape") setSavingPreset(false);
              }}
              placeholder="Preset name…"
              className="flex-1 h-7 text-xs rounded-md border border-border bg-background px-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
            />
            <button
              onClick={() => { if (presetName.trim()) { onSavePreset?.(presetName.trim()); setSavingPreset(false); } }}
              disabled={!presetName.trim()}
              className="h-7 px-2 text-[11px] font-medium rounded-md bg-primary text-white disabled:opacity-40 hover:bg-primary/90 transition-colors"
            >Save</button>
            <button onClick={() => setSavingPreset(false)} className="h-7 px-1.5 text-[11px] rounded-md border border-border text-muted-foreground hover:bg-muted transition-colors">✕</button>
          </div>
        )}
      </div>
    </PopoverContent>
  );

  const settingsPanel = (
    <PopoverContent side={popSide} align="center" sideOffset={10} className="w-64 p-4 space-y-3">
      <p className="text-xs font-semibold text-foreground">Settings</p>
      <div className="space-y-1">
        <label className="text-[11px] font-medium text-muted-foreground">Page URL</label>
        <div className="flex items-center">
          <span className="text-xs text-muted-foreground bg-muted border border-r-0 rounded-l-md px-2 h-8 flex items-center shrink-0">/p/</span>
          <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} placeholder="your-resource" className="h-8 text-sm rounded-l-none" />
        </div>
      </div>
    </PopoverContent>
  );


  /* ── Mobile bottom bar ── */
  if (isMobile && !isSide) {
    const iconPanelBtn = (key: string, Icon: React.ElementType, title: string) => (
      <button
        onClick={() => toggle(key)}
        title={title}
        className={`flex flex-col items-center justify-center w-12 h-10 rounded-xl transition-colors gap-0.5 ${
          panel === key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        <Icon className="h-4 w-4" />
        <span className="text-[9px] font-medium leading-none">{title}</span>
      </button>
    );

    return (
      <div className="absolute bottom-0 left-0 right-0 z-50 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="pointer-events-auto bg-white/97 backdrop-blur-xl border-t border-black/8 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]"
        >
          {/* Row 1 — tool icons */}
          <div className="flex items-center px-1 pt-1.5 pb-0.5 gap-0.5">
            <button
              onClick={onBack}
              className="flex items-center justify-center w-10 h-10 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div className="h-5 w-px bg-border mx-0.5 shrink-0" />

            <Popover open={panel === "image"} onOpenChange={(o) => setPanel(o ? "image" : null)}>
              <PopoverTrigger asChild><span>{iconPanelBtn("image", Image, "Image")}</span></PopoverTrigger>
              {imagePanel}
            </Popover>
            <Popover open={panel === "content"} onOpenChange={(o) => setPanel(o ? "content" : null)}>
              <PopoverTrigger asChild><span>{iconPanelBtn("content", Type, "Content")}</span></PopoverTrigger>
              {contentPanel}
            </Popover>
            <Popover open={panel === "design"} onOpenChange={(o) => setPanel(o ? "design" : null)}>
              <PopoverTrigger asChild><span>{iconPanelBtn("design", Palette, "Design")}</span></PopoverTrigger>
              {designPanel}
            </Popover>
            <Popover open={panel === "settings"} onOpenChange={(o) => setPanel(o ? "settings" : null)}>
              <PopoverTrigger asChild><span>{iconPanelBtn("settings", Settings, "Settings")}</span></PopoverTrigger>
              {settingsPanel}
            </Popover>

            <div className="h-5 w-px bg-border mx-0.5 shrink-0" />

            <button onClick={onUndo} disabled={!canUndo} className="flex items-center justify-center w-9 h-10 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0">
              <Undo2 className="h-3.5 w-3.5" />
            </button>
            <button onClick={onRedo} disabled={!canRedo} className="flex items-center justify-center w-9 h-10 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0">
              <Redo2 className="h-3.5 w-3.5" />
            </button>

            <div className="flex-1" />

            <button
              onClick={onToggleLock}
              className={`flex items-center justify-center w-9 h-10 rounded-xl shrink-0 transition-colors ${
                locked ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {locked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
            </button>
          </div>

          {/* Row 2 — publish action */}
          <div className="flex gap-2 px-3 pb-4 pt-1">
            <Button
              size="lg"
              className="flex-1 h-11 text-sm font-semibold rounded-xl"
              onClick={onSave}
            >
              {isEditing ? "Update" : "Publish"}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ── Side panel mode ── */
  if (isSide) {
    const iconBtn = (key: string, Icon: React.ElementType, title: string) => (
      <button onClick={() => toggle(key)} title={title} className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-colors ${panel === key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
        <Icon className="h-4 w-4" />
        <span className="text-[8px] font-medium leading-none">{title}</span>
      </button>
    );
    return (
      <div className="absolute right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-0.5 py-2.5 bg-white/95 backdrop-blur-xl rounded-2xl border border-black/8 shadow-2xl pointer-events-auto">
        <button onClick={onBack} title="Back" className="w-11 h-11 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <button onClick={onTogglePosition} title="Switch to bottom bar" className="w-11 h-11 rounded-xl flex flex-col items-center justify-center gap-0.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <PanelBottom className="h-4 w-4" />
          <span className="text-[8px] font-medium leading-none">Bottom</span>
        </button>
        <div className="w-10 h-px bg-border my-0.5" />
        <Popover open={panel === "image"} onOpenChange={(o) => setPanel(o ? "image" : null)}>
          <PopoverTrigger asChild><span>{iconBtn("image", Image, "Image")}</span></PopoverTrigger>
          {imagePanel}
        </Popover>
        <Popover open={panel === "content"} onOpenChange={(o) => setPanel(o ? "content" : null)}>
          <PopoverTrigger asChild><span>{iconBtn("content", Type, "Content")}</span></PopoverTrigger>
          {contentPanel}
        </Popover>
        <Popover open={panel === "design"} onOpenChange={(o) => setPanel(o ? "design" : null)}>
          <PopoverTrigger asChild><span>{iconBtn("design", Palette, "Design")}</span></PopoverTrigger>
          {designPanel}
        </Popover>
        <Popover open={panel === "settings"} onOpenChange={(o) => setPanel(o ? "settings" : null)}>
          <PopoverTrigger asChild><span>{iconBtn("settings", Settings, "Settings")}</span></PopoverTrigger>
          {settingsPanel}
        </Popover>
        <div className="w-10 h-px bg-border my-0.5" />
        <button onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)" className="w-11 h-11 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-colors text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed">
          <Undo2 className="h-4 w-4" />
          <span className="text-[8px] font-medium leading-none">Undo</span>
        </button>
        <button onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Shift+Z)" className="w-11 h-11 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-colors text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed">
          <Redo2 className="h-4 w-4" />
          <span className="text-[8px] font-medium leading-none">Redo</span>
        </button>
        <div className="w-10 h-px bg-border my-0.5" />
        <button
          onClick={onToggleLock}
          title={locked ? "Locked — click to unlock" : "Unlocked — click to lock"}
          className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-colors ${
            locked ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          {locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
          <span className="text-[8px] font-medium leading-none">{locked ? "Locked" : "Free"}</span>
        </button>
        <div className="flex-1" />
        <Button size="sm" className="w-12 h-9 text-[11px] font-semibold rounded-xl px-0" onClick={onSave}>
          {isEditing ? "Upd" : "Pub"}
        </Button>
      </div>
    );
  }

  /* ── Bottom bar mode (default) ── */
  return (
    <div className="absolute bottom-7 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="pointer-events-auto flex items-center gap-0.5 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-black/8 px-2.5 py-2"
      >
        <button onClick={onBack} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors mr-0.5">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Untitled" className="text-sm font-semibold w-[120px] bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/50 mr-1.5 focus:ring-1 focus:ring-primary/30 focus:bg-muted rounded px-1 -mx-1 transition-all" />
        {sep}
        <Popover open={panel === "image"} onOpenChange={(o) => setPanel(o ? "image" : null)}>
          <PopoverTrigger asChild><span><BarBtn label="Image" icon={Image} active={panel === "image"} onClick={() => toggle("image")} /></span></PopoverTrigger>
          {imagePanel}
        </Popover>
        <Popover open={panel === "content"} onOpenChange={(o) => setPanel(o ? "content" : null)}>
          <PopoverTrigger asChild><span><BarBtn label="Content" icon={Type} active={panel === "content"} onClick={() => toggle("content")} /></span></PopoverTrigger>
          {contentPanel}
        </Popover>
        <Popover open={panel === "design"} onOpenChange={(o) => setPanel(o ? "design" : null)}>
          <PopoverTrigger asChild><span><BarBtn label="Design" icon={Palette} active={panel === "design"} onClick={() => toggle("design")} /></span></PopoverTrigger>
          {designPanel}
        </Popover>
        <Popover open={panel === "settings"} onOpenChange={(o) => setPanel(o ? "settings" : null)}>
          <PopoverTrigger asChild><span><BarBtn label="Settings" icon={Settings} active={panel === "settings"} onClick={() => toggle("settings")} /></span></PopoverTrigger>
          {settingsPanel}
        </Popover>
        {sep}
        <button onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)" className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
          <Undo2 className="h-3.5 w-3.5" />
        </button>
        <button onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Shift+Z)" className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
          <Redo2 className="h-3.5 w-3.5" />
        </button>
        {sep}
        <button onClick={onTogglePosition} title="Switch to side panel" className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <PanelRight className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={onToggleLock}
          title={locked ? "Locked — click to unlock" : "Unlocked — click to lock"}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
            locked ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          {locked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
        </button>
        {sep}
        <Button variant="outline" size="sm" className="h-7 px-3 text-xs rounded-lg">Save draft</Button>
        <Button size="sm" className="h-7 px-3 text-xs rounded-lg" onClick={onSave}>{isEditing ? "Update" : "Publish"}</Button>
      </motion.div>
    </div>
  );
}

/* ─── Helpers ───────────────────────────────────────────────── */

function magnetToForm(m: LeadMagnet): Form {
  return {
    title:          m.title,
    description:    m.description,
    bullets:        m.bullets        ?? defaultForm.bullets,
    bulletsEnabled: m.bulletsEnabled ?? true,
    ctaLabel:       m.ctaLabel       ?? "Get the resource",
    accentColor:    m.accentColor,
    gradientPreset: m.backgroundPreset,
    leftType:       (m.leftType as "image" | "text") ?? "image",
    imageDataUrl:   m.imageDataUrl   ?? null,
    slug:           m.slug,
    leftPanelWidth: m.leftPanelWidth ?? 48,
    imagePosition:  m.imagePosition  ?? { x: 50, y: 50 },
    bannerHeight:   m.bannerHeight   ?? 44,
    textElements:   (m.textElements as Record<TextElKey, TextEl>) ?? defaultForm.textElements,
    hiddenBlocks:   (m.hiddenBlocks as TextElKey[]) ?? [],
    tagline:        m.tagline ?? "",
  };
}

/* ─── Page ──────────────────────────────────────────────────── */

const NEW_DRAFT_KEY = "sendlet-new-draft";
const UPLOAD_KEY = "sendlet-upload";

function readNewDraft(): { mode: "pick" | "edit"; layout: string; form: Form } | null {
  try {
    const raw = sessionStorage.getItem(NEW_DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function readUploadDraft(): { title: string; fileName: string; fileSize: number; fileType?: string; fileDataUrl?: string | null; linkUrl?: string } | null {
  try {
    const raw = sessionStorage.getItem(UPLOAD_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export default function TemplatePicker() {
  const [, setLocation] = useLocation();
  const { id } = useParams<{ id?: string }>();
  const editingMagnet = id ? leadMagnets.find((m) => m.id === id) : undefined;
  const { isSignedIn, signIn } = useAuth();

  const [mode, setMode] = useState<"pick" | "edit">(() => {
    if (editingMagnet) return "edit";
    return readNewDraft()?.mode ?? "pick";
  });
  const [layout, setLayout] = useState<string>(() => {
    if (editingMagnet) return editingMagnet.layout ?? "simple";
    return readNewDraft()?.layout ?? "simple";
  });
  const [form, setForm] = useState<Form>(() => {
    if (editingMagnet) return magnetToForm(editingMagnet);
    const draft = readNewDraft();
    if (draft) return draft.form;
    const upload = readUploadDraft();
    if (upload?.title) return { ...defaultForm, title: upload.title };
    return defaultForm;
  });
  const [barPosition, setBarPosition] = useState<"bottom" | "side">("bottom");
  const [locked, setLocked] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [authGateOpen, setAuthGateOpen] = useState(false);
  const [gateEmail, setGateEmail] = useState("");
  const [gateSubmitting, setGateSubmitting] = useState(false);

  // ─── Undo / redo ────────────────────────────────────────────
  type FormSnapshot = {
    textElements: Form["textElements"];
    hiddenBlocks: Form["hiddenBlocks"];
    bulletsEnabled: Form["bulletsEnabled"];
    leftPanelWidth: Form["leftPanelWidth"];
    bannerHeight: Form["bannerHeight"];
    imagePosition: Form["imagePosition"];
  };

  const snapForm = (f: Form): FormSnapshot => ({
    textElements:  f.textElements,
    hiddenBlocks:  f.hiddenBlocks,
    bulletsEnabled: f.bulletsEnabled,
    leftPanelWidth: f.leftPanelWidth,
    bannerHeight:   f.bannerHeight,
    imagePosition:  f.imagePosition,
  });

  const applySnapshot = (snap: FormSnapshot) =>
    setForm((f) => ({ ...f, ...snap }));

  const MAX_HISTORY = 20;
  const historyStack = useRef<FormSnapshot[]>([]);
  const historyIndex = useRef(-1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  // separate debounce refs so drag and discrete actions don't collide
  const dragDebounceRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSerialized   = useRef("");

  const pushSnapshot = (snap: FormSnapshot) => {
    const s = JSON.stringify(snap);
    if (s === lastSerialized.current) return;
    lastSerialized.current = s;
    const stack = historyStack.current.slice(0, historyIndex.current + 1);
    stack.push(snap);
    const capped = stack.length > MAX_HISTORY ? stack.slice(-MAX_HISTORY) : stack;
    historyStack.current = capped;
    historyIndex.current = capped.length - 1;
    setCanUndo(capped.length > 1);
    setCanRedo(false);
  };

  // debounced for continuous changes (dragging / resizing)
  useEffect(() => {
    if (mode !== "edit") return;
    const snap = snapForm(form);
    const s = JSON.stringify(snap.textElements);
    if (s === JSON.stringify(JSON.parse(lastSerialized.current || "null")?.textElements ?? null)) return;
    if (dragDebounceRef.current) clearTimeout(dragDebounceRef.current);
    dragDebounceRef.current = setTimeout(() => pushSnapshot(snap), 200);
    return () => { if (dragDebounceRef.current) clearTimeout(dragDebounceRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.textElements, mode]);

  // immediate for discrete actions (hide/show, bullets, layout resizing)
  useEffect(() => {
    if (mode !== "edit") return;
    pushSnapshot(snapForm(form));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.hiddenBlocks, form.bulletsEnabled, form.leftPanelWidth, form.bannerHeight, form.imagePosition, mode]);

  const handleUndo = () => {
    if (historyIndex.current <= 0) return;
    historyIndex.current -= 1;
    const snap = historyStack.current[historyIndex.current];
    lastSerialized.current = JSON.stringify(snap);
    applySnapshot(snap);
    setCanUndo(historyIndex.current > 0);
    setCanRedo(true);
  };

  const handleRedo = () => {
    if (historyIndex.current >= historyStack.current.length - 1) return;
    historyIndex.current += 1;
    const snap = historyStack.current[historyIndex.current];
    lastSerialized.current = JSON.stringify(snap);
    applySnapshot(snap);
    setCanUndo(true);
    setCanRedo(historyIndex.current < historyStack.current.length - 1);
  };

  // stable refs so the keyboard effect never goes stale
  const handleUndoRef = useRef(handleUndo);
  const handleRedoRef = useRef(handleRedo);
  useEffect(() => { handleUndoRef.current = handleUndo; });
  useEffect(() => { handleRedoRef.current = handleRedo; });

  useEffect(() => {
    if (mode !== "edit") return;
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      if (e.key === "z" && !e.shiftKey) { e.preventDefault(); handleUndoRef.current(); }
      if (e.key === "z" &&  e.shiftKey) { e.preventDefault(); handleRedoRef.current(); }
      if (e.key === "y")                { e.preventDefault(); handleRedoRef.current(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode]);

  // ─── Persist new-magnet draft to sessionStorage ──────────────
  useEffect(() => {
    if (editingMagnet) return;
    try {
      sessionStorage.setItem(NEW_DRAFT_KEY, JSON.stringify({ mode, layout, form }));
    } catch { /* ignore quota errors */ }
  }, [mode, layout, form, editingMagnet]);

  // ─── Intercept native back-button to stay on page ────────────
  useEffect(() => {
    if (editingMagnet) return;
    const onPop = () => {
      if (mode === "edit") {
        history.pushState({ sendletEdit: true }, "");
        setMode("pick");
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [mode, editingMagnet]);

  // ─── Custom presets ──────────────────────────────────────────
  const [customPresets, setCustomPresets] = useState<CustomPreset[]>(() => {
    try { return JSON.parse(localStorage.getItem(CUSTOM_PRESETS_KEY) ?? "[]"); }
    catch { return []; }
  });

  const handleSavePreset = (name: string) => {
    const preset: CustomPreset = { id: `custom-${Date.now()}`, name, elements: { ...form.textElements } };
    const next = [...customPresets, preset];
    setCustomPresets(next);
    localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(next));
    setActivePreset(preset.id);
    setLocked(true);
  };

  const handleDeleteCustomPreset = (id: string) => {
    const next = customPresets.filter((p) => p.id !== id);
    setCustomPresets(next);
    localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(next));
    if (activePreset === id) { setActivePreset(null); setLocked(false); }
  };

  const applyCustomPreset = (preset: CustomPreset) => {
    setForm((f) => ({ ...f, textElements: preset.elements }));
    setActivePreset(preset.id);
    setLocked(true);
  };

  // ─── Built-in presets + lock ─────────────────────────────────
  const applyPreset = (preset: typeof LAYOUT_PRESETS[0]) => {
    const isDark = layout === "fullimage";
    const els = isDark ? preset.dark : preset.light;
    setForm((f) => ({ ...f, textElements: { ...els, tagline: els.tagline ?? f.textElements.tagline } }));
    setActivePreset(preset.id);
    setLocked(true);
  };

  const handleToggleLock = () => {
    if (!locked && activePreset === null) {
      applyPreset(LAYOUT_PRESETS[0]);
    } else {
      setLocked((l) => !l);
    }
  };

  const handleStart = () => {
    if (layout === "fullimage") {
      setForm((f) => ({
        ...f,
        textElements: {
          headline:    { ...f.textElements.headline,    backdrop: "glass", color: "#ffffff", x: 5, y: 7,  w: 90, size: 15 },
          description: { ...f.textElements.description, backdrop: "glass", color: "#ffffff", x: 5, y: 26, w: 90 },
          bullets:     { ...f.textElements.bullets,     backdrop: "glass", color: "#ffffff", x: 5, y: 45, w: 90 },
          form:        { ...f.textElements.form,        backdrop: "glass", color: "#ffffff", x: 5, y: 67, w: 90 },
          tagline:     f.textElements.tagline,
        },
      }));
    }
    setMode("edit");
    if (!editingMagnet) {
      history.pushState({ sendletEdit: true }, "");
    }
  };

  const handleBack = () => {
    if (editingMagnet) {
      setLocation(`/lead-magnets/${editingMagnet.id}`);
    } else {
      setMode("pick");
    }
  };

  const doSave = async () => {
    const slug = form.slug || `resource-${Date.now()}`;
    const upload = readUploadDraft();
    const formState = {
      bullets:        form.bullets,
      bulletsEnabled: form.bulletsEnabled,
      ctaLabel:       form.ctaLabel,
      imageDataUrl:   form.imageDataUrl,
      leftType:       form.leftType,
      leftPanelWidth: form.leftPanelWidth,
      imagePosition:  form.imagePosition,
      bannerHeight:   form.bannerHeight,
      textElements:   form.textElements,
      hiddenBlocks:   form.hiddenBlocks,
      tagline:        form.tagline,
    };

    if (editingMagnet) {
      const nextMagnet: LeadMagnet = {
        ...editingMagnet,
        title:            form.title || "Untitled",
        slug,
        description:      form.description,
        accentColor:      form.accentColor,
        backgroundPreset: form.gradientPreset,
        layout,
        ...formState,
      };
      updateMagnet(editingMagnet.id, nextMagnet);
      await updateLeadMagnetInSupabase(nextMagnet);
      try { sessionStorage.removeItem(NEW_DRAFT_KEY); sessionStorage.removeItem(UPLOAD_KEY); } catch { /* ignore */ }
      setLocation("/dashboard");
    } else {
      const newId = crypto.randomUUID();
      const nextMagnet: LeadMagnet = {
        id:               newId,
        title:            form.title || "Untitled",
        slug,
        description:      form.description,
        status:           "draft",
        visits:           0,
        weeklyVisits:     0,
        leads:            0,
        weeklyLeads:      0,
        conversionRate:   0,
        lastLead:         null,
        accentColor:      form.accentColor,
        backgroundPreset: form.gradientPreset,
        layout,
        createdAt:        new Date().toISOString().split("T")[0],
        fileName:         upload?.fileName,
        fileSize:         upload?.fileSize,
        resourceUrl:      upload?.linkUrl ?? null,
        resourceType:     upload?.linkUrl ? "external_url" : upload?.fileName ? "file" : "none",
        ...formState,
      };
      saveMagnet(nextMagnet);
      await saveLeadMagnetToSupabase(nextMagnet, upload);
      try { sessionStorage.removeItem(NEW_DRAFT_KEY); sessionStorage.removeItem(UPLOAD_KEY); } catch { /* ignore */ }
      setLocation(`/lead-magnets/${newId}/email`);
    }
  };

  const handleSave = () => {
    if (!isSignedIn && !editingMagnet) {
      setAuthGateOpen(true);
      return;
    }
    void doSave();
  };

  const previewCaption =
    layout === "simple"
      ? "Simple layout — centered opt-in card on a gradient"
      : layout === "stacked"
      ? "Stacked layout — image banner on top, form below"
      : layout === "fullimage"
      ? "Full Image — full-bleed photo with floating glass panels"
      : `Visual Split — ${form.leftType === "image" ? "photo" : "bold text"} left · form right`;

  const previewBlock = (
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
          <SimplePreview
            form={form}
            interactive={mode === "edit"}
            locked={locked}
            onUpdateTextEl={(key, u) =>
              setForm((f) => ({
                ...f,
                textElements: { ...f.textElements, [key]: { ...f.textElements[key], ...u } },
              }))
            }
            onUpdate={(partial) => setForm((f) => ({ ...f, ...partial }))}
          />
        ) : layout === "stacked" ? (
          <StackedPreview
            form={form}
            interactive={mode === "edit"}
            locked={locked}
            onUpdateTextEl={(key, u) =>
              setForm((f) => ({
                ...f,
                textElements: { ...f.textElements, [key]: { ...f.textElements[key], ...u } },
              }))
            }
            onUpdate={(partial) => setForm((f) => ({ ...f, ...partial }))}
          />
        ) : layout === "fullimage" ? (
          <FullImagePreview
            form={form}
            interactive={mode === "edit"}
            locked={locked}
            onUpdateTextEl={(key, u) =>
              setForm((f) => ({
                ...f,
                textElements: { ...f.textElements, [key]: { ...f.textElements[key], ...u } },
              }))
            }
            onUpdate={(partial) => setForm((f) => ({ ...f, ...partial }))}
          />
        ) : (
          <SplitPreview
            form={form}
            interactive={mode === "edit"}
            locked={locked}
            onUpdateTextEl={(key, u) =>
              setForm((f) => ({
                ...f,
                textElements: { ...f.textElements, [key]: { ...f.textElements[key], ...u } },
              }))
            }
            onUpdate={(partial) => setForm((f) => ({ ...f, ...partial }))}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-57px)] overflow-hidden">

        {/* ── Pick mode: left panel + right preview ── */}
        <AnimatePresence>
          {mode === "pick" && (
            <motion.div
              key="picker-panel"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="w-full lg:w-[420px] xl:w-[460px] shrink-0 border-r overflow-y-auto"
            >
              <PickerPanel
                layout={layout}
                setLayout={setLayout}
                form={form}
                setForm={setForm}
                onStart={handleStart}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Preview area (both modes) ── */}
        <div className="relative flex-1 flex items-center justify-center bg-muted/30 overflow-hidden">

          {/* Pick mode: static preview pane */}
          {mode === "pick" && (
            <div className="hidden lg:block w-full max-w-2xl px-10">
              <div className="rounded-2xl overflow-hidden shadow-xl border" style={{ height: "480px" }}>
                {previewBlock}
              </div>
              <p className="text-center text-xs text-muted-foreground mt-4">{previewCaption}</p>
            </div>
          )}

          {/* Edit mode: full-canvas preview + floating bar */}
          {mode === "edit" && (
            <>
              <motion.div
                key="edit-canvas"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.22 }}
                className={`w-full max-w-3xl px-10 ${barPosition === "bottom" ? "pb-20" : "pb-6"}`}
              >
                <div className="rounded-2xl overflow-hidden shadow-xl border" style={{ height: "min(520px, calc(100dvh - 180px))", touchAction: "none" }}>
                  {previewBlock}
                </div>
                <p className="text-center text-xs text-muted-foreground mt-4">{previewCaption}</p>
              </motion.div>

              <FloatingBar
                layout={layout}
                form={form}
                setForm={setForm}
                onBack={handleBack}
                onSave={handleSave}
                isEditing={!!editingMagnet}
                barPosition={barPosition}
                onTogglePosition={() => setBarPosition(barPosition === "bottom" ? "side" : "bottom")}
                locked={locked}
                onToggleLock={handleToggleLock}
                onApplyPreset={applyPreset}
                activePreset={activePreset}
                onUndo={handleUndo}
                onRedo={handleRedo}
                canUndo={canUndo}
                canRedo={canRedo}
                customPresets={customPresets}
                onSavePreset={handleSavePreset}
                onDeleteCustomPreset={handleDeleteCustomPreset}
                onApplyCustomPreset={applyCustomPreset}
              />
            </>
          )}
        </div>

      </div>

      {/* ── Auth gate — intercepts Publish for guests ── */}
      {authGateOpen && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-sm bg-card rounded-2xl shadow-2xl overflow-hidden border border-border/40"
          >
            {/* Brand strip */}
            <div className="bg-[#0C4A44] px-6 pt-5 pb-6">
              <div className="flex items-center gap-1.5 mb-4">
                <SendIcon className="h-3.5 w-3.5 text-white/50" />
                <span className="text-white/50 text-xs font-medium tracking-wide">Sendlet</span>
              </div>
              <p className="text-white font-bold text-xl leading-snug mb-3">
                {form.title || "Your lead magnet"}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-white/50 bg-white/10 px-2 py-0.5 rounded-full">
                  {LAYOUTS.find((l) => l.id === layout)?.label ?? layout}
                </span>
                <div
                  className="w-4 h-4 rounded-full border-2 border-white/25"
                  style={{ backgroundColor: form.accentColor }}
                />
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-6">
              <h2 className="text-lg font-bold tracking-tight text-foreground mb-1">
                Your page is ready to go live
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                Create your free Sendlet account to publish it and start collecting leads.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!gateEmail || gateSubmitting) return;
                  setGateSubmitting(true);
                  void signIn(gateEmail, `${window.location.origin}/lead-magnets/new`)
                    .then(() => {
                      setAuthGateOpen(false);
                    })
                    .finally(() => {
                      setGateSubmitting(false);
                    });
                }}
                className="space-y-3"
              >
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={gateEmail}
                    onChange={(e) => setGateEmail(e.target.value)}
                    placeholder="name@example.com"
                    autoFocus
                    className="w-full pl-9 pr-3 h-10 text-sm bg-muted/50 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/50 transition-all placeholder:text-muted-foreground/50"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-11 text-sm font-semibold gap-2"
                  disabled={gateSubmitting || !gateEmail}
                >
                  {gateSubmitting ? (
                    <>Sending link...</>
                  ) : (
                    <>Send magic link <ArrowRight className="h-4 w-4" /></>
                  )}
                </Button>
              </form>

              <p className="text-[11px] text-muted-foreground/70 text-center mt-4">
                No password needed. Your draft stays here after sign-in.
              </p>
              <div className="text-center mt-2">
                <button
                  onClick={() => { setAuthGateOpen(false); setGateEmail(""); }}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel and keep editing
                </button>
              </div>
            </div>
          </motion.div>
        </div>,
        document.body
      )}

    </AppLayout>
  );
}
