import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Copy, Check, Send, ExternalLink, ChevronRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { leadMagnets, updateMagnet, saveBroadcast } from "@/data/mock";
import { PROVIDERS, integrationConnections } from "@/data/integrations";
import { useAuth } from "@/contexts/auth-context";
import { AppLayout } from "@/components/layout/app-layout";
import { updateLeadMagnetStatusInSupabase } from "@/services/sendlet-service";

const BROADCAST_PROVIDER_IDS = ["resend", "kit", "mailchimp", "beehiiv"];

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
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Detect connected email providers that support broadcasting
  const [connections] = useState(() => ({ ...integrationConnections }));
  const connectedProviders = BROADCAST_PROVIDER_IDS
    .map((pid) => PROVIDERS.find((p) => p.id === pid))
    .filter((p) => p && !!connections[p.id]) as (typeof PROVIDERS)[number][];

  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(
    () => connectedProviders[0]?.id ?? null
  );

  const selectedProvider = connectedProviders.find((p) => p.id === selectedProviderId) ?? null;

  const publish = async () => {
    if (magnet) {
      updateMagnet(magnet.id, { status: "published" });
      await updateLeadMagnetStatusInSupabase(magnet.id, "published");
    }
    setLocation("/dashboard");
  };

  const copyAndPublish = async () => {
    const text = `Subject: ${subject}\n\n${body}`;
    try { await navigator.clipboard.writeText(text); } catch { /* ignore */ }
    setCopied(true);
      setTimeout(() => void publish(), 800);
  };

  const sendBroadcast = () => {
    if (!magnet || !selectedProvider) return;
    setSending(true);
    setTimeout(() => {
      saveBroadcast({
        id: String(Date.now()),
        magnetId: magnet.id,
        subject,
        sentAt: new Date().toISOString().split("T")[0],
        recipientCount: Math.max(magnet.leads, 1),
        provider: selectedProvider.id,
      });
      updateMagnet(magnet.id, { status: "published" });
      void updateLeadMagnetStatusInSupabase(magnet.id, "published");
      setSending(false);
      setSent(true);
      setTimeout(() => setLocation("/dashboard"), 1200);
    }, 1600);
  };

  if (!magnet) {
    setLocation("/dashboard");
    return null;
  }

  /* ── Sent confirmation overlay ── */
  if (sent) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto px-6 py-10 flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Email sent!</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Sent via {selectedProvider?.name} · redirecting to your dashboard…
            </p>
          </div>
        </div>
      </AppLayout>
    );
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
            {connectedProviders.length > 0
              ? "Edit your email below, then send it directly to your audience."
              : "Edit this template and paste it into your email tool, or connect an email provider to send directly."}
          </p>
        </div>

        {/* Provider selector (if multiple connected) */}
        {connectedProviders.length > 1 && (
          <div className="flex items-center gap-2 mb-5">
            <span className="text-xs text-muted-foreground shrink-0">Send via</span>
            <div className="flex gap-1.5 flex-wrap">
              {connectedProviders.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProviderId(p.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    selectedProviderId === p.id
                      ? "border-primary/40 bg-primary/5 text-foreground shadow-sm"
                      : "border-border text-muted-foreground hover:text-foreground hover:border-border/80"
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded flex items-center justify-center text-[8px] font-bold"
                    style={{ backgroundColor: p.brandColor, color: "#fff" }}
                  >
                    {p.initials.charAt(0)}
                  </span>
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Email composer card */}
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden mb-6">

          <div className="divide-y">
            <div className="flex items-center px-5 py-3">
              <span className="w-16 text-xs font-medium text-muted-foreground shrink-0">From</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-foreground">{name}</span>
                {selectedProvider && (
                  <span
                    className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: `${selectedProvider.brandColor}18`, color: selectedProvider.brandColor }}
                  >
                    via {selectedProvider.name}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center px-5 py-3">
              <span className="w-16 text-xs font-medium text-muted-foreground shrink-0">To</span>
              <span className="text-sm text-muted-foreground italic">
                {magnet.leads > 0 ? `${magnet.leads} leads` : "Your audience"}
              </span>
            </div>
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

          <div className="border-t px-5 py-4">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={13}
              className="w-full text-sm text-foreground bg-transparent border-none outline-none resize-none leading-relaxed placeholder:text-muted-foreground/50"
              placeholder="Write your email..."
            />
          </div>

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
        <div className="flex items-center justify-between gap-3">
          <button
            className="text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
            onClick={publish}
          >
            Skip — just publish
          </button>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={copyAndPublish} className="gap-1.5" disabled={copied || sending}>
              {copied
                ? <><Check className="h-3.5 w-3.5 text-primary" /> Copied!</>
                : <><Copy className="h-3.5 w-3.5" /> Copy</>}
            </Button>

            {selectedProvider ? (
              <Button onClick={sendBroadcast} disabled={sending || !subject.trim()} className="gap-1.5 min-w-[160px]">
                {sending ? (
                  <>
                    <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <span
                      className="w-4 h-4 rounded flex items-center justify-center text-[9px] font-bold shrink-0"
                      style={{ backgroundColor: "rgba(255,255,255,0.25)" }}
                    >
                      {selectedProvider.initials.charAt(0)}
                    </span>
                    Send via {selectedProvider.name}
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={publish} className="gap-1.5">
                <Send className="h-3.5 w-3.5" />
                Publish
              </Button>
            )}
          </div>
        </div>

        {/* No provider nudge */}
        {connectedProviders.length === 0 && (
          <p className="text-xs text-muted-foreground mt-4 text-right">
            Want to send directly?{" "}
            <a href="/settings/integrations" className="text-primary hover:underline">
              Connect Resend, Kit or Mailchimp →
            </a>
          </p>
        )}

      </div>
    </AppLayout>
  );
}
