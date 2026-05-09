import { useState } from "react";
import { Link } from "wouter";
import { CheckCircle2, ChevronRight, X } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  PROVIDERS,
  DISPLAY_GROUPS,
  integrationConnections,
  saveConnection,
  removeConnection,
  type IntegrationProvider,
  type IntegrationConnection,
} from "@/data/integrations";

/* ── Brand icon ───────────────────────────────────────────── */

function BrandIcon({
  provider,
  size = "md",
}: {
  provider: IntegrationProvider;
  size?: "sm" | "md" | "lg";
}) {
  const cls =
    size === "sm"
      ? "w-8 h-8 text-[11px]"
      : size === "lg"
      ? "w-14 h-14 text-xl"
      : "w-11 h-11 text-sm";
  return (
    <div
      className={`${cls} rounded-xl flex items-center justify-center font-bold shrink-0 select-none`}
      style={{
        backgroundColor: provider.brandColor,
        color: provider.textColor === "dark" ? "#111" : "#fff",
      }}
    >
      {provider.initials}
    </div>
  );
}

/* ── Connected badge ──────────────────────────────────────── */

function ConnectedBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full whitespace-nowrap">
      <CheckCircle2 className="h-3 w-3" />
      Connected
    </span>
  );
}

/* ── Integration tile ─────────────────────────────────────── */

function IntegrationTile({
  provider,
  connected,
  onSetup,
}: {
  provider: IntegrationProvider;
  connected: boolean;
  onSetup: () => void;
}) {
  return (
    <div className="bg-card border rounded-xl p-5 flex flex-col gap-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <BrandIcon provider={provider} />
        {connected && <ConnectedBadge />}
      </div>
      <div className="flex-1 min-h-0">
        <p className="text-sm font-semibold text-foreground mb-0.5">{provider.name}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">{provider.tagline}</p>
      </div>
      <Button
        variant={connected ? "outline" : "default"}
        size="sm"
        className="w-full text-xs h-8 justify-between"
        onClick={onSetup}
      >
        <span>{connected ? "Manage" : "Set up"}</span>
        <ChevronRight className="h-3.5 w-3.5 opacity-40" />
      </Button>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────── */

export default function SettingsIntegrationsPage() {
  const [connections, setConnections] = useState<Record<string, IntegrationConnection>>(
    () => ({ ...integrationConnections })
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const provider = selected ? PROVIDERS.find((p) => p.id === selected) ?? null : null;
  const isAlreadyConnected = provider ? !!connections[provider.id] : false;

  const openSetup = (p: IntegrationProvider) => {
    setFormValues(connections[p.id]?.config ?? {});
    setSelected(p.id);
  };

  const closeSetup = () => {
    setSelected(null);
    setFormValues({});
    setSaving(false);
  };

  const handleSave = () => {
    if (!provider) return;
    const allRequiredFilled = provider.fields
      .filter((f) => f.required)
      .every((f) => formValues[f.key]?.trim());
    if (!allRequiredFilled) return;
    setSaving(true);
    setTimeout(() => {
      saveConnection(provider.id, { ...formValues });
      setConnections({ ...integrationConnections });
      setSaving(false);
      closeSetup();
    }, 600);
  };

  const handleDisconnect = () => {
    if (!provider) return;
    removeConnection(provider.id);
    setConnections({ ...integrationConnections });
    closeSetup();
  };

  const connectedCount = Object.keys(connections).length;

  return (
    <AppLayout>
      <div className="container max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
            <Link href="/dashboard" className="hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-foreground">Integrations</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Integrations</h1>
              <p className="text-sm text-muted-foreground mt-1 max-w-lg leading-relaxed">
                Connect the tools you already use. Every new lead is automatically sent to your
                connected destinations — no code needed.
              </p>
            </div>
            {connectedCount > 0 && (
              <p className="text-sm text-muted-foreground shrink-0">
                {connectedCount} integration{connectedCount !== 1 ? "s" : ""} connected
              </p>
            )}
          </div>
        </div>

        {/* Category groups */}
        <div className="space-y-12">
          {DISPLAY_GROUPS.map((group) => {
            const groupProviders = group.ids
              .map((id) => PROVIDERS.find((p) => p.id === id))
              .filter(Boolean) as IntegrationProvider[];

            return (
              <section key={group.label}>
                <div className="mb-5">
                  <h2 className="text-base font-semibold">{group.label}</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">{group.description}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupProviders.map((p) => (
                    <IntegrationTile
                      key={p.id}
                      provider={p}
                      connected={!!connections[p.id]}
                      onSetup={() => openSetup(p)}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* Zapier explainer banner */}
        <div className="mt-12 bg-muted/50 border rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white shrink-0"
            style={{ backgroundColor: "#FF4A00" }}
          >
            Z
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">Don't see your tool?</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              Connect Zapier to send leads to Gmail, Notion, Salesforce, Google Contacts, and
              5,000+ other apps — no code required.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => openSetup(PROVIDERS.find((p) => p.id === "zapier")!)}
          >
            Set up Zapier
          </Button>
        </div>

      </div>

      {/* Setup / manage dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) closeSetup(); }}>
        {provider && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <BrandIcon provider={provider} size="sm" />
                <div>
                  <DialogTitle className="text-base leading-tight">{provider.name}</DialogTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">{provider.tagline}</p>
                </div>
                {isAlreadyConnected && (
                  <div className="ml-auto">
                    <ConnectedBadge />
                  </div>
                )}
              </div>
              <DialogDescription className="text-sm leading-relaxed">
                {provider.description}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-1">
              {provider.fields.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <Label htmlFor={`field-${field.key}`} className="text-sm">
                    {field.label}
                    {field.required && (
                      <span className="text-destructive ml-0.5">*</span>
                    )}
                  </Label>
                  <Input
                    id={`field-${field.key}`}
                    type={
                      field.type === "password"
                        ? "password"
                        : field.type === "email"
                        ? "email"
                        : "text"
                    }
                    placeholder={field.placeholder}
                    value={formValues[field.key] ?? ""}
                    onChange={(e) =>
                      setFormValues((v) => ({ ...v, [field.key]: e.target.value }))
                    }
                    className={field.type === "password" || field.type === "url" ? "font-mono text-sm" : "text-sm"}
                    autoComplete="off"
                  />
                  {field.hint && (
                    <p className="text-xs text-muted-foreground leading-relaxed">{field.hint}</p>
                  )}
                </div>
              ))}
            </div>

            <div className={`flex gap-2 pt-2 ${isAlreadyConnected ? "justify-between" : "justify-end"}`}>
              {isAlreadyConnected && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5"
                  onClick={handleDisconnect}
                >
                  <X className="h-3.5 w-3.5" />
                  Disconnect
                </Button>
              )}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={closeSetup}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={
                    saving ||
                    provider.fields
                      .filter((f) => f.required)
                      .some((f) => !formValues[f.key]?.trim())
                  }
                >
                  {saving ? "Saving…" : isAlreadyConnected ? "Update" : "Connect"}
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </AppLayout>
  );
}
