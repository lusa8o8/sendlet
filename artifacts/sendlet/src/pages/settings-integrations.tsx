import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, CheckCircle2, Code2, Download, PlugZap, Trash2 } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  deleteLeadWebhook,
  fetchLeadWebhook,
  saveLeadWebhook,
  type LeadWebhook,
} from "@/services/sendlet-service";

function StatusBadge({ webhook }: { webhook: LeadWebhook | null }) {
  if (!webhook) {
    return (
      <span className="inline-flex rounded-full border bg-muted px-2.5 py-1 text-xs text-muted-foreground">
        Not connected
      </span>
    );
  }

  if (webhook.last_error) {
    return (
      <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs text-amber-800">
        Last send failed
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs text-emerald-800">
      <CheckCircle2 className="h-3 w-3" />
      Connected
    </span>
  );
}

export default function SettingsIntegrationsPage() {
  const [webhook, setWebhook] = useState<LeadWebhook | null>(null);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchLeadWebhook()
      .then((data) => {
        if (!mounted) return;
        setWebhook(data);
        setWebhookUrl(data?.url ?? "");
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Could not load integration settings.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleSaveWebhook = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const saved = await saveLeadWebhook(webhookUrl.trim(), true);
      setWebhook(saved);
      setWebhookUrl(saved.url);
      setMessage("Webhook saved. New leads will be sent there automatically.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save webhook.");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveWebhook = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await deleteLeadWebhook();
      setWebhook(null);
      setWebhookUrl("");
      setMessage("Webhook removed.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove webhook.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto max-w-4xl px-6 py-10">
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link href="/dashboard" className="hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-foreground">Integrations</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Integrations</h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Keep Sendlet simple. Export leads when you need a file, or send every new lead to one webhook that works with Zapier, Make, n8n, Pipedream, and your own API.
          </p>
        </div>

        <div className="space-y-4">
          <section className="rounded-2xl border bg-card p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                  <Download className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <h2 className="text-base font-semibold">CSV export</h2>
                  <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
                    Download your leads as a spreadsheet from the Leads page. This is the backup integration that works with every tool.
                  </p>
                </div>
              </div>
              <Button asChild variant="outline" className="shrink-0">
                <Link href="/leads">
                  Open leads
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </section>

          <section className="rounded-2xl border bg-card p-5">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <PlugZap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-semibold">Lead webhook</h2>
                    <StatusBadge webhook={webhook} />
                  </div>
                  <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
                    Send every new lead to one HTTPS endpoint. Use this with Zapier, Make, n8n, Pipedream, Airtable automations, or your own backend.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <Input
                  id="webhook-url"
                  value={webhookUrl}
                  onChange={(event) => setWebhookUrl(event.target.value)}
                  placeholder="https://hooks.zapier.com/hooks/catch/..."
                  className="font-mono text-sm"
                  disabled={loading || saving}
                />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Sendlet posts a <span className="font-mono">lead.created</span> JSON payload after the lead is captured.
                </p>
              </div>

              <div className="rounded-xl border bg-muted/40 p-3">
                <pre className="overflow-x-auto text-xs leading-relaxed text-muted-foreground">
{`{
  "event": "lead.created",
  "lead": { "email": "lusa@example.com", "name": "Lusa" },
  "lead_magnet": { "title": "Top 10 Study Tips", "slug": "top-10-study-tips" }
}`}
                </pre>
              </div>

              {webhook?.last_sent_at ? (
                <p className="text-xs text-muted-foreground">
                  Last attempt: {new Date(webhook.last_sent_at).toLocaleString()}
                  {typeof webhook.last_status === "number" ? `, status ${webhook.last_status}` : ""}
                </p>
              ) : null}
              {webhook?.last_error ? (
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                  {webhook.last_error}
                </p>
              ) : null}
              {message ? (
                <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
                  {message}
                </p>
              ) : null}
              {error ? (
                <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                  {error}
                </p>
              ) : null}

              <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                <Button
                  onClick={handleSaveWebhook}
                  disabled={loading || saving || !webhookUrl.trim()}
                >
                  {saving ? "Saving..." : webhook ? "Update webhook" : "Save webhook"}
                </Button>
                {webhook ? (
                  <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={handleRemoveWebhook} disabled={saving}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove webhook
                  </Button>
                ) : null}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border bg-card p-5">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                <Code2 className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-semibold">API access</h2>
                  <span className="rounded-full border bg-muted px-2.5 py-1 text-xs text-muted-foreground">Coming later</span>
                </div>
                <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  A small API for fetching lead magnets, leads, and delivery events belongs here once real users ask for it. For now, CSV and webhook cover the useful cases.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
