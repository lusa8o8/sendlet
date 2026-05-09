import { useState, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { Upload, FileText, CheckCircle2, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/layout/app-layout";

const UPLOAD_KEY = "sendlet-upload";

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

export default function UploadPage() {
  const [, setLocation] = useLocation();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const accept = (f: File) => {
    setFile(f);
    setTitle(toTitle(f.name));
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) accept(f);
    e.target.value = "";
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) accept(f);
  }, []);

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  const proceed = () => {
    try {
      sessionStorage.setItem(
        UPLOAD_KEY,
        JSON.stringify({ title: title.trim(), fileName: file?.name ?? "", fileSize: file?.size ?? 0 })
      );
    } catch { /* ignore */ }
    setLocation("/lead-magnets/new");
  };

  const skip = () => {
    try { sessionStorage.removeItem(UPLOAD_KEY); } catch { /* ignore */ }
    setLocation("/lead-magnets/new");
  };

  return (
    <AppLayout>
      <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">

          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-2xl font-semibold tracking-tight mb-2">
              Upload your lead magnet
            </h1>
            <p className="text-sm text-muted-foreground">
              Start with the file you're giving away — we'll build the opt-in page around it.
            </p>
          </div>

          {/* Drop zone */}
          {!file ? (
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
                <p className="text-xs text-muted-foreground">
                  PDF, EPUB, DOCX, ZIP — or any format
                </p>
              </div>
              <span className="text-xs text-muted-foreground/60">or click to browse</span>
              <input
                ref={inputRef}
                type="file"
                className="sr-only"
                onChange={onFileChange}
              />
            </div>
          ) : (
            /* File selected state */
            <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">

              {/* File info row */}
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
                  onClick={() => { setFile(null); setTitle(""); }}
                  className="text-muted-foreground hover:text-foreground transition-colors ml-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Title edit */}
              <div className="border-t px-5 py-4">
                <label className="text-xs font-medium text-muted-foreground block mb-2">
                  Page title
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give your lead magnet a title"
                  className="w-full text-sm font-medium text-foreground bg-transparent border-none outline-none placeholder:text-muted-foreground/50"
                  autoFocus
                  onKeyDown={(e) => { if (e.key === "Enter" && title.trim()) proceed(); }}
                />
              </div>

              {/* Change file link */}
              <div className="border-t px-5 py-3 bg-muted/30">
                <button
                  onClick={() => inputRef.current?.click()}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Change file
                </button>
                <input
                  ref={inputRef}
                  type="file"
                  className="sr-only"
                  onChange={onFileChange}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex flex-col items-center gap-4">
            <Button
              className="w-full gap-2"
              disabled={!file || !title.trim()}
              onClick={proceed}
            >
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
