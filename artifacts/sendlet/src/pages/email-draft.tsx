import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Copy, Check, Send, ExternalLink, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { leadMagnets, updateMagnet } from "@/data/mock";
import { useAuth } from "@/contexts/auth-context";
import { AppLayout } from "@/components/layout/app-layout";

export default function EmailDraftPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { name } = useAuth();

  const magnet = leadMagnets.find((m) => m.id === id);
  const publicUrl = magnet ? `${window.location.origin}/p/${magnet.slug}` : "";
  const firstName = name.split(" ")[0] || name;

  const defaultSubject = magnet ? `${magnet.title} — it's free` : "";
  const defaultBody = magnet
    ? [
        `Hey there,`,
        ``,
        `I just published something I think you'll love — and it's completely free.`,
        ``,
        `📎 ${magnet.title}`,
        ...(magnet.description ? [``, magnet.description] : []),
        ``,
        `👉 ${publicUrl}`,
        ``,
        `Just enter your email there and I'll send it over straight away.`,
        ``,
        `Hope you find it useful!`,
        ``,
        firstName,
      ].join("\n")
    : "";

  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState(defaultBody);
  const [copied, setCopied] = useState(false);

  const publish = () => {
    if (magnet) updateMagnet(magnet.id, { status: "published" });
    setLocation("/dashboard");
  };

  const copyAndPublish = async () => {
    const text = `Subject: ${subject}\n\n${body}`;
    try { await navigator.clipboard.writeText(text); } catch { /* ignore */ }
    setCopied(true);
    setTimeout(() => {
      publish();
    }, 800);
  };

  if (!magnet) {
    setLocation("/dashboard");
    return null;
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* Step indicator */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
          <span className="text-foreground font-medium">Lead magnet</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">Email</span>
          <ChevronRight className="h-3 w-3" />
          <span>Publish</span>
        </div>

        {/* Header */}
        <div className="mb-7">
          <h1 className="text-2xl font-semibold tracking-tight">Draft an announcement email</h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Optional — edit this template and paste it into your email tool. No sending happens here.
          </p>
        </div>

        {/* Email composer card */}
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden mb-6">

          {/* Header rows */}
          <div className="divide-y">
            {/* From */}
            <div className="flex items-center px-5 py-3">
              <span className="w-16 text-xs font-medium text-muted-foreground shrink-0">From</span>
              <span className="text-sm text-foreground">{name}</span>
            </div>
            {/* To */}
            <div className="flex items-center px-5 py-3">
              <span className="w-16 text-xs font-medium text-muted-foreground shrink-0">To</span>
              <span className="text-sm text-muted-foreground italic">Your audience</span>
            </div>
            {/* Subject */}
            <div className="flex items-center px-5 py-3 gap-3">
              <span className="w-16 text-xs font-medium text-muted-foreground shrink-0">Subject</span>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Your subject line"
                className="flex-1 text-sm font-medium text-foreground bg-transparent border-none outline-none placeholder:text-muted-foreground/50"
              />
            </div>
          </div>

          {/* Body */}
          <div className="border-t px-5 py-4">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={13}
              className="w-full text-sm text-foreground bg-transparent border-none outline-none resize-none leading-relaxed placeholder:text-muted-foreground/50"
              placeholder="Write your email..."
            />
          </div>

          {/* Live URL footer */}
          <div className="border-t bg-muted/30 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[11px] font-medium text-muted-foreground shrink-0">Live page:</span>
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-primary hover:underline truncate flex items-center gap-1"
              >
                {publicUrl}
                <ExternalLink className="h-2.5 w-2.5 shrink-0" />
              </a>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            onClick={publish}
          >
            Skip — just publish
          </button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={copyAndPublish}
              className="gap-1.5"
              disabled={copied}
            >
              {copied
                ? <><Check className="h-3.5 w-3.5 text-primary" /> Copied!</>
                : <><Copy className="h-3.5 w-3.5" /> Copy &amp; publish</>}
            </Button>
            <Button onClick={publish} className="gap-1.5">
              <Send className="h-3.5 w-3.5" />
              Publish
            </Button>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
