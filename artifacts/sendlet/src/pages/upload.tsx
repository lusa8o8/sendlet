import { useState, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { Upload, FileText, CheckCircle2, X, ArrowRight, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/layout/app-layout";
import { saveUploadDraft } from "@/lib/upload-draft";

function toTitle(filename: string): string {
  return filename
    .replace(/\.[^/.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function titleFromUrl(url: string): string {
  try {
    const u = new URL(url);
    const last = u.pathname.split("/").filter(Boolean).pop() ?? "";
    if (last) return toTitle(decodeURIComponent(last));
    return toTitle(u.hostname.replace(/^www\./, ""));
  } catch {
    return "";
  }
}

type Mode = "file" | "link";

function readFileDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function UploadPage() {
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<Mode>("file");

  /* ── File mode state ── */
  const [file, setFile] = useState<File | null>(null);
  const [fileTitle, setFileTitle] = useState("");
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ── Link mode state ── */
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [linkTouched, setLinkTouched] = useState(false);

  /* ── File handlers ── */
  const acceptFile = (f: File) => {
    setError(null);
    setFile(f);
    setFileTitle(toTitle(f.name));
  };
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) acceptFile(f);
    e.target.value = "";
  };
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) acceptFile(f);
  }, []);
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  /* ── Link handlers ── */
  const onLinkChange = (val: string) => {
    setLinkUrl(val);
    if (!linkTouched && val) {
      const auto = titleFromUrl(val);
      if (auto) setLinkTitle(auto);
    }
  };

  /* ── Actions ── */
  const proceed = async () => {
    setError(null);
    try {
      const payload =
        mode === "file"
          ? {
              title: fileTitle.trim(),
              fileName: file?.name ?? "",
              fileSize: file?.size ?? 0,
              fileType: file?.type ?? "application/octet-stream",
              fileDataUrl: file ? await readFileDataUrl(file) : null,
            }
          : { title: linkTitle.trim(), fileName: "", fileSize: 0, linkUrl: linkUrl.trim() };
      await saveUploadDraft(payload);
      setLocation("/lead-magnets/new");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not prepare this resource. Please try again.");
    }
  };

  const skip = async () => {
    await saveUploadDraft(null);
    setLocation("/lead-magnets/new");
  };

  const fileReady = mode === "file" && !!file && !!fileTitle.trim();
  const linkReady = mode === "link" && !!linkUrl.trim() && !!linkTitle.trim();
  const canProceed = fileReady || linkReady;

  return (
    <AppLayout>
      <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold tracking-tight mb-2">
              Upload your lead magnet
            </h1>
            <p className="text-sm text-muted-foreground">
              Start with the file you're giving away — we'll build the opt-in page around it.
            </p>
          </div>

          {/* Mode tabs */}
          <div className="flex rounded-xl border bg-muted/40 p-1 gap-1 mb-6">
            {(["file", "link"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-all ${
                  mode === m
                    ? "bg-card shadow-sm text-foreground border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "file" ? (
                  <><Upload className="h-3.5 w-3.5" /> Upload a file</>
                ) : (
                  <><Link2 className="h-3.5 w-3.5" /> Paste a link</>
                )}
              </button>
            ))}
          </div>

          {/* ── File mode ── */}
          {mode === "file" && (
            !file ? (
              <div
                className={`relative rounded-2xl border-2 border-dashed transition-colors cursor-pointer flex flex-col items-center justify-center gap-4 py-20 px-8 text-center ${
                  dragging
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40 hover:bg-muted/30"
                }`}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onClick={() => inputRef.current?.click()}
              >
                <div className={`rounded-2xl p-4 transition-colors ${dragging ? "bg-primary/10" : "bg-muted"}`}>
                  <Upload className={`h-8 w-8 transition-colors ${dragging ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    {dragging ? "Drop it here" : "Drop your file here"}
                  </p>
                  <p className="text-xs text-muted-foreground">PDF, EPUB, DOCX, ZIP — or any format</p>
                </div>
                <span className="text-xs text-muted-foreground/60">or click to browse</span>
                <input ref={inputRef} type="file" className="sr-only" onChange={onFileChange} />
              </div>
            ) : (
              <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
                <div className="flex items-center gap-4 px-5 py-4">
                  <div className="rounded-xl bg-primary/10 p-3 shrink-0">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatSize(file.size)}</p>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  <button
                    onClick={() => { setFile(null); setFileTitle(""); }}
                    className="text-muted-foreground hover:text-foreground transition-colors ml-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="border-t px-5 py-4">
                  <label className="text-xs font-medium text-muted-foreground block mb-2">Page title</label>
                  <input
                    value={fileTitle}
                    onChange={(e) => setFileTitle(e.target.value)}
                    placeholder="Give your lead magnet a title"
                    className="w-full text-sm font-medium text-foreground bg-transparent border-none outline-none placeholder:text-muted-foreground/50"
                    autoFocus
                    onKeyDown={(e) => { if (e.key === "Enter" && fileTitle.trim()) proceed(); }}
                  />
                </div>
                <div className="border-t px-5 py-3 bg-muted/30">
                  <button
                    onClick={() => inputRef.current?.click()}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Change file
                  </button>
                  <input ref={inputRef} type="file" className="sr-only" onChange={onFileChange} />
                </div>
              </div>
            )
          )}

          {/* ── Link mode ── */}
          {mode === "link" && (
            <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
              <div className="px-5 py-4 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground block">Resource URL</label>
                  <div className="relative">
                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <input
                      value={linkUrl}
                      onChange={(e) => onLinkChange(e.target.value)}
                      placeholder="https://notion.so/your-guide"
                      className="w-full pl-9 pr-3 py-2.5 text-sm bg-muted/40 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition placeholder:text-muted-foreground/50"
                      autoFocus
                      type="url"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Notion page, Google Doc, Gumroad, or any public URL.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground block">Page title</label>
                  <input
                    value={linkTitle}
                    onChange={(e) => { setLinkTitle(e.target.value); setLinkTouched(true); }}
                    placeholder="Give your lead magnet a title"
                    className="w-full text-sm font-medium text-foreground bg-transparent border-none outline-none placeholder:text-muted-foreground/50"
                    onKeyDown={(e) => { if (e.key === "Enter" && linkReady) proceed(); }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex flex-col items-center gap-4">
            {error ? (
              <div className="w-full rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                {error}
              </div>
            ) : null}
            <Button className="w-full gap-2" disabled={!canProceed} onClick={proceed}>
              Continue — design my page
              <ArrowRight className="h-4 w-4" />
            </Button>
            <button
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              onClick={skip}
            >
              Start without a file
            </button>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
