import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Copy, Check, Mail, ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { leadMagnets } from "@/data/mock";
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
        `Hope it's useful!`,
        ``,
        firstName,
      ].join("\n")
    : "";

  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState(defaultBody);
  const [copied, setCopied] = useState<"subject" | "body" | "all" | null>(null);

  const copy = async (what: "subject" | "body" | "all") => {
    const text =
      what === "subject" ? subject
      : what === "body" ? body
      : `Subject: ${subject}\n\n${body}`;
    try { await navigator.clipboard.writeText(text); } catch { /* ignore */ }
    setCopied(what);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!magnet) {
    setLocation("/dashboard");
    return null;
  }

  const CopyBtn = ({ what }: { what: "subject" | "body" | "all" }) => (
    <button
      onClick={() => copy(what)}
      className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
    >
      {copied === what
        ? <><Check className="h-3 w-3 text-primary" /> Copied</>
        : <><Copy className="h-3 w-3" /> Copy</>}
    </button>
  );

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-medium text-primary uppercase tracking-widest mb-2">
            <Mail className="h-3.5 w-3.5" />
            Draft announcement email
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Your page is live — let people know
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Edit this draft and paste it into your email tool. No sending happens here.
          </p>
        </div>

        {/* Published URL callout */}
        <div className="flex items-center gap-3 rounded-xl border bg-muted/40 px-4 py-3 mb-8">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Live URL</p>
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-primary hover:underline truncate flex items-center gap-1"
            >
              {publicUrl}
              <ExternalLink className="h-3 w-3 shrink-0" />
            </a>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 gap-1.5"
            onClick={() => copy("all")}
          >
            {copied === "all" ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
            Copy full email
          </Button>
        </div>

        {/* Subject */}
        <div className="space-y-1.5 mb-5">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-subject">Subject line</Label>
            <CopyBtn what="subject" />
          </div>
          <Input
            id="email-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Your subject line"
            className="font-medium"
          />
        </div>

        {/* Body */}
        <div className="space-y-1.5 mb-8">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-body">Email body</Label>
            <CopyBtn what="body" />
          </div>
          <Textarea
            id="email-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={14}
            className="font-mono text-sm resize-none leading-relaxed"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t">
          <button
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setLocation("/dashboard")}
          >
            Skip for now
          </button>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => copy("all")} className="gap-1.5">
              {copied === "all" ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
              Copy email
            </Button>
            <Button onClick={() => setLocation("/dashboard")} className="gap-1.5">
              Go to dashboard
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
