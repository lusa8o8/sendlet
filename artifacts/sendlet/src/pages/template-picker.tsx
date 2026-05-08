import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Image,
  Layers2,
  Link,
  Palette,
  Plus,
  Settings,
  Type,
  Upload,
  X,
} from "lucide-react";
import { leadMagnets, saveMagnet } from "@/data/mock";

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

/* ─── Form state ────────────────────────────────────────────── */

interface TextEl {
  x:        number; // 0-100 % from left of right panel
  y:        number; // 0-100 % from top of right panel
  w:        number; // 0-100 % width
  size:     number; // font-size in px
  color:    string; // hex colour
  backdrop?: "none" | "glass" | "card"; // background panel style
}

type TextElKey = "headline" | "description" | "bullets" | "form";

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
  textElements: {
    headline:    { x: 4, y: 5,  w: 92, size: 14, color: "#0f172a", backdrop: "none" },
    description: { x: 4, y: 27, w: 92, size: 11, color: "#64748b", backdrop: "none" },
    bullets:     { x: 4, y: 50, w: 92, size: 10, color: "#374151", backdrop: "none" },
    form:        { x: 4, y: 70, w: 92, size: 10, color: "#0f172a", backdrop: "none" },
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
  onUpdateTextEl,
}: {
  form: Form;
  interactive?: boolean;
  onUpdateTextEl?: (key: TextElKey, u: Partial<TextEl>) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const gradient = GRADIENT_PRESETS.find((g) => g.id === form.gradientPreset)?.value
    ?? GRADIENT_PRESETS[0].value;
  const accent = form.accentColor || ACCENT;
  const bullets = form.bulletsEnabled ? form.bullets.filter(Boolean) : [];
  const displayBullets = bullets.length ? bullets : ["Key benefit one", "Key benefit two", "Key benefit three"];
  const textElements: Record<TextElKey, TextEl> = {
    ...defaultForm.textElements,
    ...(form.textElements ?? {}),
  };

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
        {interactive ? (
          <div className="relative" style={{ height: "290px" }}>
            {isDragging && (
              <>
                <div className="absolute inset-y-0 pointer-events-none z-30" style={{ left: "50%", width: "1px", background: "repeating-linear-gradient(to bottom, rgba(14,165,233,0.55) 0 4px, transparent 4px 8px)" }} />
                <div className="absolute inset-x-0 pointer-events-none z-30" style={{ top: "50%", height: "1px", background: "repeating-linear-gradient(to right, rgba(14,165,233,0.55) 0 4px, transparent 4px 8px)" }} />
                <div className="absolute inset-y-0 pointer-events-none z-30" style={{ left: "4%", width: "1px", background: "repeating-linear-gradient(to bottom, rgba(148,163,184,0.45) 0 4px, transparent 4px 8px)" }} />
                <div className="absolute inset-y-0 pointer-events-none z-30" style={{ right: "4%", width: "1px", background: "repeating-linear-gradient(to bottom, rgba(148,163,184,0.45) 0 4px, transparent 4px 8px)" }} />
              </>
            )}
            <DraggableTextBlock el={textElements.headline} onUpdate={(u) => onUpdateTextEl?.("headline", u)} fontClass="font-bold tracking-tight leading-snug" label="Headline" onDragStart={() => setIsDragging(true)} onDragEnd={() => setIsDragging(false)}>
              {form.title || "Your Resource Title"}
            </DraggableTextBlock>
            <DraggableTextBlock el={textElements.description} onUpdate={(u) => onUpdateTextEl?.("description", u)} fontClass="leading-relaxed" label="Description" onDragStart={() => setIsDragging(true)} onDragEnd={() => setIsDragging(false)}>
              {form.description || "A short description of what they'll get and why it helps."}
            </DraggableTextBlock>
            {form.bulletsEnabled && (
              <DraggableTextBlock el={textElements.bullets} onUpdate={(u) => onUpdateTextEl?.("bullets", u)} label="Benefits" onDragStart={() => setIsDragging(true)} onDragEnd={() => setIsDragging(false)}>
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
            <DraggableTextBlock el={textElements.form} onUpdate={(u) => onUpdateTextEl?.("form", u)} label="Form" onDragStart={() => setIsDragging(true)} onDragEnd={() => setIsDragging(false)}>
              <div className="space-y-1.5">
                <div className="h-5 rounded-md border border-slate-200 text-[9px] text-muted-foreground flex items-center px-2 bg-white">Enter your email address</div>
                <div className="h-5 rounded-md text-[9px] text-white flex items-center justify-center font-medium" style={{ backgroundColor: accent }}>{form.ctaLabel || "Get the resource"}</div>
                <p className="text-center text-[8px] text-muted-foreground">No spam. Unsubscribe anytime.</p>
              </div>
            </DraggableTextBlock>
          </div>
        ) : (
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
              <div className="h-5 rounded-md border text-[9px] text-muted-foreground flex items-center px-2">Enter your email address</div>
              <div className="h-5 rounded-md text-[9px] text-white flex items-center justify-center font-medium" style={{ backgroundColor: accent }}>{form.ctaLabel || "Get the resource"}</div>
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
  onDragStart,
  onDragEnd,
  editType,
  textValue,
  onTextChange,
  bulletValues,
  onBulletsChange,
  accentColor,
}: {
  el: TextEl;
  onUpdate: (u: Partial<TextEl>) => void;
  children: React.ReactNode;
  fontClass?: string;
  label: string;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  editType?: "text" | "bullets";
  textValue?: string;
  onTextChange?: (v: string) => void;
  bulletValues?: string[];
  onBulletsChange?: (bs: string[]) => void;
  accentColor?: string;
}) {
  const ref        = useRef<HTMLDivElement>(null);
  const colorRef   = useRef<HTMLInputElement>(null);
  const taRef      = useRef<HTMLTextAreaElement>(null);
  const [selected, setSelected] = useState(false);
  const [editing,  setEditing]  = useState(false);
  const dragRef    = useRef<{ mx: number; my: number; x0: number; y0: number } | null>(null);
  const resizeRef  = useRef<{ mx: number; w0: number } | null>(null);

  const startDrag = (e: React.MouseEvent) => {
    if (editing) return;
    e.preventDefault(); e.stopPropagation();
    setSelected(true);
    onDragStart?.();
    dragRef.current = { mx: e.clientX, my: e.clientY, x0: el.x, y0: el.y };
    const onMove = (me: MouseEvent) => {
      if (!dragRef.current || !ref.current) return;
      const r = ref.current.parentElement!.getBoundingClientRect();
      const dx = ((me.clientX - dragRef.current.mx) / r.width)  * 100;
      const dy = ((me.clientY - dragRef.current.my) / r.height) * 100;
      onUpdate({
        x: Math.max(0, Math.min(85, dragRef.current.x0 + dx)),
        y: Math.max(0, Math.min(80, dragRef.current.y0 + dy)),
      });
    };
    const onUp = () => {
      dragRef.current = null;
      onDragEnd?.();
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    resizeRef.current = { mx: e.clientX, w0: el.w };
    const onMove = (me: MouseEvent) => {
      if (!resizeRef.current || !ref.current) return;
      const r = ref.current.parentElement!.getBoundingClientRect();
      const dx = ((me.clientX - resizeRef.current.mx) / r.width) * 100;
      onUpdate({ w: Math.max(15, Math.min(97, resizeRef.current.w0 + dx)) });
    };
    const onUp = () => { resizeRef.current = null; document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
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
        ...backdropInlineStyle,
      }}
      className={`group ${editing ? "cursor-text" : "cursor-move"} ${editing ? "" : "select-none"} ${fontClass} ${
        selected
          ? "outline outline-[1.5px] outline-sky-400 outline-offset-1"
          : "outline outline-1 outline-transparent hover:outline-sky-200"
      }`}
      onMouseDown={startDrag}
      onDoubleClick={enterEdit}
    >
      {/* ── Editable content ── */}
      {editing && editType === "text" ? (
        <textarea
          ref={taRef}
          value={textValue ?? ""}
          placeholder={label}
          onChange={(e) => { onTextChange?.(e.target.value); autoSize(e.target); }}
          onBlur={exitEdit}
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
        children
      )}

      {/* Floating toolbar — visible when selected and not editing */}
      {selected && !editing && (
        <div
          className="absolute -top-7 left-0 flex items-center gap-1 bg-white border border-slate-200 rounded-md shadow-md px-1.5 py-0.5 z-50 whitespace-nowrap"
          onMouseDown={(e) => e.stopPropagation()}
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
          {/* Backdrop style toggle */}
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
            <button
              onClick={enterEdit as unknown as React.MouseEventHandler<HTMLButtonElement>}
              className="text-[7px] text-sky-500 hover:text-sky-700 border-l border-slate-200 pl-1 font-medium"
              title="Double-click to edit text"
            >✎ edit</button>
          )}
        </div>
      )}

      {/* Bottom-right resize handle — hidden while editing */}
      {!editing && (
        <div
          className={`absolute -bottom-1.5 -right-1.5 w-3 h-3 rounded-sm bg-sky-400 cursor-se-resize transition-opacity ${
            selected ? "opacity-100" : "opacity-0 group-hover:opacity-60"
          }`}
          onMouseDown={startResize}
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
  onUpdateTextEl,
  onUpdate,
}: {
  form: Form;
  interactive?: boolean;
  onUpdateTextEl?: (key: TextElKey, u: Partial<TextEl>) => void;
  onUpdate?: (partial: Partial<Form>) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgFileRef   = useRef<HTMLInputElement>(null);

  const accent = form.accentColor || ACCENT;
  const bullets = form.bulletsEnabled ? form.bullets.filter(Boolean) : [];
  const displayBullets = bullets.length ? bullets : ["Benefit 1", "Benefit 2", "Benefit 3"];
  const textElements: Record<TextElKey, TextEl> = {
    ...defaultForm.textElements,
    ...(form.textElements ?? {}),
  };
  const panelWidth = form.leftPanelWidth ?? 48;
  const imgPos     = form.imagePosition  ?? { x: 50, y: 50 };

  const startDividerDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    const onMove = (me: MouseEvent) => {
      if (!containerRef.current) return;
      const r = containerRef.current.getBoundingClientRect();
      onUpdate?.({ leftPanelWidth: Math.max(20, Math.min(75, ((me.clientX - r.left) / r.width) * 100)) });
    };
    const onUp = () => { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  const startImagePan = (e: React.MouseEvent) => {
    e.preventDefault();
    const sx = imgPos.x; const sy = imgPos.y;
    const mx = e.clientX; const my = e.clientY;
    const onMove = (me: MouseEvent) => {
      onUpdate?.({ imagePosition: {
        x: Math.max(0, Math.min(100, sx - (me.clientX - mx) * 0.35)),
        y: Math.max(0, Math.min(100, sy - (me.clientY - my) * 0.35)),
      }});
    };
    const onUp = () => { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  const handleImgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { if (typeof ev.target?.result === "string") onUpdate?.({ imageDataUrl: ev.target.result }); };
    reader.readAsDataURL(file); e.target.value = "";
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
                style={{ objectPosition: `${imgPos.x}% ${imgPos.y}%`, cursor: interactive ? "move" : undefined }}
                onMouseDown={interactive ? startImagePan : undefined}
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
            <div className="relative z-10 px-6 pb-6">
              <p className="text-white font-extrabold text-xl leading-tight">
                {form.title || "Your bold headline goes here"}
              </p>
            </div>
          </>
        )}

        {/* Creator identity */}
        <div className="relative z-10 px-4 pb-4 flex items-center gap-2 shrink-0">
          <div className="w-6 h-6 rounded-full bg-white/20 ring-2 ring-white/30 flex items-center justify-center text-white font-semibold text-[10px]">S</div>
          <span className="text-white/60 text-[10px]">Sarah Chen</span>
        </div>
      </div>

      {/* Right panel */}
      {interactive ? (
        /* ── Interactive edit mode: all four blocks draggable ── */
        <div className="flex-1 bg-white relative overflow-hidden">

          {/* ── Alignment guides (visible while any block is dragged) ── */}
          {isDragging && (
            <>
              {/* Vertical centre */}
              <div className="absolute inset-y-0 pointer-events-none z-30" style={{ left: "50%", width: "1px", background: "repeating-linear-gradient(to bottom, rgba(14,165,233,0.55) 0 4px, transparent 4px 8px)" }} />
              {/* Horizontal centre */}
              <div className="absolute inset-x-0 pointer-events-none z-30" style={{ top: "50%", height: "1px", background: "repeating-linear-gradient(to right, rgba(14,165,233,0.55) 0 4px, transparent 4px 8px)" }} />
              {/* Left margin */}
              <div className="absolute inset-y-0 pointer-events-none z-30" style={{ left: "4%", width: "1px", background: "repeating-linear-gradient(to bottom, rgba(148,163,184,0.45) 0 4px, transparent 4px 8px)" }} />
              {/* Right margin */}
              <div className="absolute inset-y-0 pointer-events-none z-30" style={{ right: "4%", width: "1px", background: "repeating-linear-gradient(to bottom, rgba(148,163,184,0.45) 0 4px, transparent 4px 8px)" }} />
              {/* Top margin */}
              <div className="absolute inset-x-0 pointer-events-none z-30" style={{ top: "5%", height: "1px", background: "repeating-linear-gradient(to right, rgba(148,163,184,0.45) 0 4px, transparent 4px 8px)" }} />
            </>
          )}

          {/* Headline */}
          <DraggableTextBlock
            el={textElements.headline}
            onUpdate={(u) => onUpdateTextEl?.("headline", u)}
            fontClass="font-bold tracking-tight leading-snug"
            label="Headline"
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setIsDragging(false)}
            editType="text"
            textValue={form.title}
            onTextChange={(v) => onUpdate?.({ title: v })}
          >
            {form.title || "Your Resource Title"}
          </DraggableTextBlock>

          {/* Description */}
          <DraggableTextBlock
            el={textElements.description}
            onUpdate={(u) => onUpdateTextEl?.("description", u)}
            fontClass="leading-relaxed"
            label="Description"
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setIsDragging(false)}
            editType="text"
            textValue={form.description}
            onTextChange={(v) => onUpdate?.({ description: v })}
          >
            {form.description || "A short description of what they'll get and why it helps."}
          </DraggableTextBlock>

          {/* Benefits / bullets */}
          {form.bulletsEnabled && (
            <DraggableTextBlock
              el={textElements.bullets}
              onUpdate={(u) => onUpdateTextEl?.("bullets", u)}
              label="Benefits"
              onDragStart={() => setIsDragging(true)}
              onDragEnd={() => setIsDragging(false)}
              editType="bullets"
              bulletValues={displayBullets}
              onBulletsChange={(bs) => onUpdate?.({ bullets: bs })}
              accentColor={accent}
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
          <DraggableTextBlock
            el={textElements.form}
            onUpdate={(u) => onUpdateTextEl?.("form", u)}
            label="Form"
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setIsDragging(false)}
          >
            <div className="space-y-1.5">
              <div className="h-5 rounded-md border border-slate-200 text-[9px] text-muted-foreground flex items-center px-2 bg-white">
                Enter your email address
              </div>
              <div
                className="h-5 rounded-md text-[9px] text-white flex items-center justify-center font-medium"
                style={{ backgroundColor: accent }}
              >
                {form.ctaLabel || "Get the resource"}
              </div>
              <p className="text-center text-[8px] text-muted-foreground">No spam. Unsubscribe anytime.</p>
            </div>
          </DraggableTextBlock>
        </div>
      ) : (
        /* ── Static pick mode ── */
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
      )}

      {/* ── Panel-width drag divider (interactive only) ── */}
      {interactive && (
        <div
          className="absolute top-0 bottom-0 z-40 cursor-col-resize flex items-center justify-center group"
          style={{ left: `${panelWidth}%`, width: "14px", marginLeft: "-7px" }}
          onMouseDown={startDividerDrag}
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
  onUpdateTextEl,
  onUpdate,
}: {
  form: Form;
  interactive?: boolean;
  onUpdateTextEl?: (key: TextElKey, u: Partial<TextEl>) => void;
  onUpdate?: (partial: Partial<Form>) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgFileRef   = useRef<HTMLInputElement>(null);

  const accent = form.accentColor || ACCENT;
  const bullets = form.bulletsEnabled ? form.bullets.filter(Boolean) : [];
  const displayBullets = bullets.length ? bullets : ["Key benefit one", "Key benefit two", "Key benefit three"];
  const textElements: Record<TextElKey, TextEl> = {
    ...defaultForm.textElements,
    ...(form.textElements ?? {}),
  };
  const bannerH = form.bannerHeight ?? 44;
  const imgPos  = form.imagePosition ?? { x: 50, y: 50 };

  const startBannerDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    const onMove = (me: MouseEvent) => {
      if (!containerRef.current) return;
      const r = containerRef.current.getBoundingClientRect();
      onUpdate?.({ bannerHeight: Math.max(25, Math.min(70, ((me.clientY - r.top) / r.height) * 100)) });
    };
    const onUp = () => { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  const startImagePan = (e: React.MouseEvent) => {
    e.preventDefault();
    const sx = imgPos.x; const sy = imgPos.y;
    const mx = e.clientX; const my = e.clientY;
    const onMove = (me: MouseEvent) => {
      onUpdate?.({ imagePosition: {
        x: Math.max(0, Math.min(100, sx - (me.clientX - mx) * 0.35)),
        y: Math.max(0, Math.min(100, sy - (me.clientY - my) * 0.35)),
      }});
    };
    const onUp = () => { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  const handleImgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { if (typeof ev.target?.result === "string") onUpdate?.({ imageDataUrl: ev.target.result }); };
    reader.readAsDataURL(file); e.target.value = "";
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
        {form.imageDataUrl ? (
          <>
            <img
              src={form.imageDataUrl}
              alt="Banner"
              className="absolute inset-0 w-full h-full object-cover select-none"
              style={{ objectPosition: `${imgPos.x}% ${imgPos.y}%`, cursor: interactive ? "move" : undefined }}
              onMouseDown={interactive ? startImagePan : undefined}
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
        )}
        <div className="absolute bottom-3 left-4 flex items-center gap-1.5 z-10">
          <div className="w-6 h-6 rounded-full bg-white/90 shadow flex items-center justify-center font-semibold text-foreground text-[9px]">S</div>
          <span className="text-[10px] font-medium drop-shadow" style={{ color: form.imageDataUrl ? "white" : "rgba(255,255,255,0.7)" }}>Sarah Chen</span>
        </div>
        {/* Banner height drag handle */}
        {interactive && (
          <div
            className="absolute bottom-0 left-0 right-0 z-20 cursor-row-resize flex justify-center items-end pb-0.5"
            style={{ height: "12px" }}
            onMouseDown={startBannerDrag}
          >
            <div className="w-10 h-1 rounded-full bg-white/50 group-hover:bg-white transition-all duration-150" />
          </div>
        )}
      </div>
      {interactive && <input ref={imgFileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleImgUpload} />}

      {/* Bottom: drag surface in edit mode, static otherwise */}
      {interactive ? (
        <div className="flex-1 relative overflow-hidden bg-white">
          {isDragging && (
            <>
              <div className="absolute inset-y-0 pointer-events-none z-30" style={{ left: "50%", width: "1px", background: "repeating-linear-gradient(to bottom, rgba(14,165,233,0.55) 0 4px, transparent 4px 8px)" }} />
              <div className="absolute inset-x-0 pointer-events-none z-30" style={{ top: "50%", height: "1px", background: "repeating-linear-gradient(to right, rgba(14,165,233,0.55) 0 4px, transparent 4px 8px)" }} />
              <div className="absolute inset-y-0 pointer-events-none z-30" style={{ left: "4%", width: "1px", background: "repeating-linear-gradient(to bottom, rgba(148,163,184,0.45) 0 4px, transparent 4px 8px)" }} />
              <div className="absolute inset-y-0 pointer-events-none z-30" style={{ right: "4%", width: "1px", background: "repeating-linear-gradient(to bottom, rgba(148,163,184,0.45) 0 4px, transparent 4px 8px)" }} />
              <div className="absolute inset-x-0 pointer-events-none z-30" style={{ top: "5%", height: "1px", background: "repeating-linear-gradient(to right, rgba(148,163,184,0.45) 0 4px, transparent 4px 8px)" }} />
            </>
          )}
          <DraggableTextBlock el={textElements.headline} onUpdate={(u) => onUpdateTextEl?.("headline", u)} fontClass="font-bold tracking-tight leading-snug" label="Headline" onDragStart={() => setIsDragging(true)} onDragEnd={() => setIsDragging(false)} editType="text" textValue={form.title} onTextChange={(v) => onUpdate?.({ title: v })}>
            {form.title || "Your Resource Title"}
          </DraggableTextBlock>
          <DraggableTextBlock el={textElements.description} onUpdate={(u) => onUpdateTextEl?.("description", u)} fontClass="leading-relaxed" label="Description" onDragStart={() => setIsDragging(true)} onDragEnd={() => setIsDragging(false)} editType="text" textValue={form.description} onTextChange={(v) => onUpdate?.({ description: v })}>
            {form.description || "A short description of what they'll get and why it helps."}
          </DraggableTextBlock>
          {form.bulletsEnabled && (
            <DraggableTextBlock el={textElements.bullets} onUpdate={(u) => onUpdateTextEl?.("bullets", u)} label="Benefits" onDragStart={() => setIsDragging(true)} onDragEnd={() => setIsDragging(false)} editType="bullets" bulletValues={displayBullets} onBulletsChange={(bs) => onUpdate?.({ bullets: bs })} accentColor={accent}>
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
          <DraggableTextBlock el={textElements.form} onUpdate={(u) => onUpdateTextEl?.("form", u)} label="Form" onDragStart={() => setIsDragging(true)} onDragEnd={() => setIsDragging(false)}>
            <div className="space-y-1.5">
              <div className="h-5 rounded-md border border-slate-200 text-[9px] text-muted-foreground flex items-center px-2 bg-white">Enter your email address</div>
              <div className="h-5 rounded-md text-[9px] text-white flex items-center justify-center font-medium" style={{ backgroundColor: accent }}>{form.ctaLabel || "Get the resource"}</div>
              <p className="text-center text-[8px] text-muted-foreground">No spam. Unsubscribe anytime.</p>
            </div>
          </DraggableTextBlock>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden px-5 py-4 flex flex-col justify-center">
          <h2 className="text-sm font-bold tracking-tight mb-1 text-foreground leading-snug">
            {form.title || "Your Resource Title"}
          </h2>
          <p className="text-[11px] text-muted-foreground mb-2.5 leading-relaxed">
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
            <div className="h-5 rounded-md border text-[9px] text-muted-foreground flex items-center px-2">Enter your email address</div>
            <div className="h-5 rounded-md text-[9px] text-white flex items-center justify-center font-medium" style={{ backgroundColor: accent }}>{form.ctaLabel || "Get the resource"}</div>
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
  onUpdateTextEl,
  onUpdate,
}: {
  form: Form;
  interactive?: boolean;
  onUpdateTextEl?: (key: TextElKey, u: Partial<TextEl>) => void;
  onUpdate?: (partial: Partial<Form>) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const imgFileRef = useRef<HTMLInputElement>(null);
  const accent = form.accentColor || ACCENT;
  const bullets = form.bulletsEnabled ? form.bullets.filter(Boolean) : [];
  const displayBullets = bullets.length ? bullets : ["Key benefit one", "Key benefit two", "Key benefit three"];
  const textElements: Record<TextElKey, TextEl> = {
    ...defaultForm.textElements,
    ...(form.textElements ?? {}),
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
              const reader = new FileReader();
              reader.onload = (ev) => {
                if (typeof ev.target?.result === "string")
                  onUpdate?.({ imageDataUrl: ev.target.result });
              };
              reader.readAsDataURL(file);
              e.target.value = "";
            }}
          />

          {/* Guide lines */}
          {isDragging && (
            <>
              <div className="absolute inset-y-0 pointer-events-none z-30" style={{ left: "50%", width: "1px", background: "repeating-linear-gradient(to bottom,rgba(14,165,233,0.6) 0 4px,transparent 4px 8px)" }} />
              <div className="absolute inset-x-0 pointer-events-none z-30" style={{ top: "50%", height: "1px", background: "repeating-linear-gradient(to right,rgba(14,165,233,0.6) 0 4px,transparent 4px 8px)" }} />
            </>
          )}

          {/* Draggable blocks */}
          <DraggableTextBlock
            el={textElements.headline}
            onUpdate={(u) => onUpdateTextEl?.("headline", u)}
            fontClass="font-bold tracking-tight leading-snug"
            label="Headline"
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setIsDragging(false)}
            editType="text"
            textValue={form.title}
            onTextChange={(v) => onUpdate?.({ title: v })}
          >
            {form.title || "Your Resource Title"}
          </DraggableTextBlock>

          <DraggableTextBlock
            el={textElements.description}
            onUpdate={(u) => onUpdateTextEl?.("description", u)}
            fontClass="leading-relaxed"
            label="Description"
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setIsDragging(false)}
            editType="text"
            textValue={form.description}
            onTextChange={(v) => onUpdate?.({ description: v })}
          >
            {form.description || "A short description of what they'll get and why it helps."}
          </DraggableTextBlock>

          {form.bulletsEnabled && (
            <DraggableTextBlock
              el={textElements.bullets}
              onUpdate={(u) => onUpdateTextEl?.("bullets", u)}
              label="Benefits"
              onDragStart={() => setIsDragging(true)}
              onDragEnd={() => setIsDragging(false)}
              editType="bullets"
              bulletValues={displayBullets}
              onBulletsChange={(bs) => onUpdate?.({ bullets: bs })}
              accentColor={accent}
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

          <DraggableTextBlock
            el={textElements.form}
            onUpdate={(u) => onUpdateTextEl?.("form", u)}
            label="Form"
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setIsDragging(false)}
          >
            <div className="space-y-1.5">
              <div className="h-5 rounded-md border border-white/30 text-[9px] text-white/70 flex items-center px-2 bg-white/10">
                Enter your email address
              </div>
              <div className="h-5 rounded-md text-[9px] text-white flex items-center justify-center font-medium" style={{ backgroundColor: accent }}>
                {form.ctaLabel || "Get the resource"}
              </div>
              <p className="text-center text-[8px] text-white/60">No spam. Unsubscribe anytime.</p>
            </div>
          </DraggableTextBlock>
        </div>
      ) : (
        /* ── Static pick mode — glass panels preview ── */
        <div className="w-full h-full relative z-10">
          <div className="absolute" style={{ left: "5%", top: "8%", width: "90%" }}>
            <div style={glassPanel}>
              <p className="text-sm font-bold text-white leading-snug">
                {form.title || "Your Resource Title"}
              </p>
            </div>
          </div>

          <div className="absolute" style={{ left: "5%", top: "26%", width: "90%" }}>
            <div style={glassPanel}>
              <p className="text-[11px] text-white/85 leading-relaxed">
                {form.description || "A short description of what they'll get and why it helps."}
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
              <div className="h-5 rounded-md text-[9px] text-white flex items-center justify-center font-medium" style={{ backgroundColor: accent }}>
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

      {/* Left panel type (only for visual split) */}
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
}: {
  layout: string;
  form: Form;
  setForm: (f: Form) => void;
  onBack: () => void;
  onSave: () => void;
}) {
  const [panel, setPanel] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggle = (p: string) => setPanel((cur) => (cur === p ? null : p));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === "string")
        setForm({ ...form, imageDataUrl: ev.target.result });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const setBullet = (i: number, val: string) => {
    const next = [...form.bullets]; next[i] = val;
    setForm({ ...form, bullets: next });
  };
  const addBullet = () => setForm({ ...form, bullets: [...form.bullets, ""] });
  const removeBullet = (i: number) =>
    setForm({ ...form, bullets: form.bullets.filter((_, idx) => idx !== i) });

  const sep = <div className="w-px h-5 bg-border/70 mx-0.5 shrink-0" />;

  return (
    <div className="absolute bottom-7 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="pointer-events-auto flex items-center gap-0.5 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-black/8 px-2.5 py-2"
      >
        {/* ── Back + title ── */}
        <button
          onClick={onBack}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors mr-0.5"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Untitled"
          className="text-sm font-semibold w-[120px] bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/50 mr-1.5 focus:ring-1 focus:ring-primary/30 focus:bg-muted rounded px-1 -mx-1 transition-all"
        />

        {sep}

        {/* ── Image ── */}
        <Popover open={panel === "image"} onOpenChange={(o) => setPanel(o ? "image" : null)}>
          <PopoverTrigger asChild>
            <span>
              <BarBtn label="Image" icon={Image} active={panel === "image"} onClick={() => toggle("image")} />
            </span>
          </PopoverTrigger>
          <PopoverContent side="top" align="center" sideOffset={10} className="w-64 p-4 space-y-3">
            <p className="text-xs font-semibold text-foreground">
              {layout === "stacked" ? "Banner image" : layout === "split" ? "Panel image" : "Cover image"}
            </p>
            {form.imageDataUrl ? (
              <div className="relative rounded-lg overflow-hidden border" style={{ aspectRatio: "4/3" }}>
                <img src={form.imageDataUrl} alt="Panel" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                <button
                  onClick={() => setForm({ ...form, imageDataUrl: null })}
                  className="absolute top-2 right-2 w-6 h-6 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="h-3 w-3 text-white" />
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-2 right-2 text-[10px] bg-black/50 hover:bg-black/70 text-white rounded-md px-2 py-1 transition-colors"
                >
                  Replace
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-border rounded-lg p-4 flex flex-col items-center gap-2 hover:border-primary/40 hover:bg-primary/5 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                  <Upload className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium">Click to upload</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">JPG, PNG, WebP</p>
                </div>
              </button>
            )}
          </PopoverContent>
        </Popover>

        {/* ── Content ── */}
        <Popover open={panel === "content"} onOpenChange={(o) => setPanel(o ? "content" : null)}>
          <PopoverTrigger asChild>
            <span>
              <BarBtn label="Content" icon={Type} active={panel === "content"} onClick={() => toggle("content")} />
            </span>
          </PopoverTrigger>
          <PopoverContent side="top" align="center" sideOffset={10} className="w-72 p-4 space-y-3 max-h-[420px] overflow-y-auto">
            <p className="text-xs font-semibold text-foreground">Content</p>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground">Headline</label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Your Resource Title" className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground">Description</label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="A short description..." className="text-sm resize-none h-16" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-medium text-muted-foreground">Benefits</label>
                <button
                  onClick={() => setForm({ ...form, bulletsEnabled: !form.bulletsEnabled })}
                  className={`relative w-8 h-4 rounded-full transition-colors shrink-0 ${form.bulletsEnabled ? "bg-primary" : "bg-muted-foreground/30"}`}
                >
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
          </PopoverContent>
        </Popover>

        {/* ── Design ── */}
        <Popover open={panel === "design"} onOpenChange={(o) => setPanel(o ? "design" : null)}>
          <PopoverTrigger asChild>
            <span>
              <BarBtn label="Design" icon={Palette} active={panel === "design"} onClick={() => toggle("design")} />
            </span>
          </PopoverTrigger>
          <PopoverContent side="top" align="center" sideOffset={10} className="w-64 p-4 space-y-4">
            <p className="text-xs font-semibold text-foreground">Design</p>
            {layout === "simple" && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-muted-foreground">Background</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {GRADIENT_PRESETS.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setForm({ ...form, gradientPreset: g.id })}
                      title={g.label}
                      className={`h-8 rounded-lg transition-all ${form.gradientPreset === g.id ? "ring-2 ring-primary ring-offset-1 scale-105" : "hover:scale-105 opacity-80 hover:opacity-100"}`}
                      style={{ background: g.value }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-muted-foreground">Accent colour</label>
              <div className="flex gap-2 flex-wrap">
                {ACCENT_COLORS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setForm({ ...form, accentColor: c.value })}
                    title={c.label}
                    className={`w-7 h-7 rounded-full transition-all ${form.accentColor === c.value ? "ring-2 ring-offset-1 ring-foreground scale-110" : "hover:scale-105"}`}
                    style={{ backgroundColor: c.value }}
                  />
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* ── Settings ── */}
        <Popover open={panel === "settings"} onOpenChange={(o) => setPanel(o ? "settings" : null)}>
          <PopoverTrigger asChild>
            <span>
              <BarBtn label="Settings" icon={Settings} active={panel === "settings"} onClick={() => toggle("settings")} />
            </span>
          </PopoverTrigger>
          <PopoverContent side="top" align="center" sideOffset={10} className="w-64 p-4 space-y-3">
            <p className="text-xs font-semibold text-foreground">Settings</p>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground">Page URL</label>
              <div className="flex items-center">
                <span className="text-xs text-muted-foreground bg-muted border border-r-0 rounded-l-md px-2 h-8 flex items-center shrink-0">/p/</span>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })}
                  placeholder="your-resource"
                  className="h-8 text-sm rounded-l-none"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {sep}

        {/* ── Actions ── */}
        <Button variant="outline" size="sm" className="h-7 px-3 text-xs rounded-lg">
          Save draft
        </Button>
        <Button size="sm" className="h-7 px-3 text-xs rounded-lg" onClick={onSave}>
          Publish
        </Button>
      </motion.div>

      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleImageUpload} />
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
    if (layout === "fullimage") {
      setForm((f) => ({
        ...f,
        textElements: {
          headline:    { ...f.textElements.headline,    backdrop: "glass", color: "#ffffff", x: 5, y: 7,  w: 90, size: 15 },
          description: { ...f.textElements.description, backdrop: "glass", color: "#ffffff", x: 5, y: 26, w: 90 },
          bullets:     { ...f.textElements.bullets,     backdrop: "glass", color: "#ffffff", x: 5, y: 45, w: 90 },
          form:        { ...f.textElements.form,        backdrop: "glass", color: "#ffffff", x: 5, y: 67, w: 90 },
        },
      }));
    }
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
    saveMagnet(newMagnet);
    setLocation("/dashboard");
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
              className="w-full lg:w-[420px] xl:w-[460px] shrink-0 border-r overflow-hidden"
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
                className="w-full max-w-3xl px-10 pb-20"
              >
                <div className="rounded-2xl overflow-hidden shadow-xl border" style={{ height: "520px" }}>
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
              />
            </>
          )}
        </div>

      </div>
    </AppLayout>
  );
}
