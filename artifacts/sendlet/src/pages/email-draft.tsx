import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { ChevronRight, ExternalLink, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { leadMagnets, updateMagnet } from "@/data/mock";
import { AppLayout } from "@/components/layout/app-layout";
import { SendletApiError, updateLeadMagnetStatusInSupabase } from "@/services/sendlet-service";

type DeliveryMode = "default" | "custom";

function defaultSubject(title: string) {
  return `Your copy of ${title}`;
}

function defaultCustomBody(title: string, description: string) {
  return [
    "Hi,",
    "",
    `Thanks for signing up. Your copy of ${title} is ready.`,
    "",
    description,
    "",
    "{{resource_link}}",
    "",
    "Hope it helps.",
  ].filter((line, index, arr) => line || arr[index - 1] !== "").join("\n");
}

export default function EmailDraftPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const magnet = leadMagnets.find((m) => m.id === id);

  const [deliveryEnabled, setDeliveryEnabled] = useState(magnet?.deliveryEmailEnabled ?? true);
  const [mode, setMode] = useState<DeliveryMode>(magnet?.deliveryEmailBody ? "custom" : "default");
  const [subject, setSubject] = useState(() => magnet ? (magnet.deliveryEmailSubject || defaultSubject(magnet.title)) : "");
  const [body, setBody] = useState(() => magnet ? (magnet.deliveryEmailBody || defaultCustomBody(magnet.title, magnet.description)) : "");
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [upgradeUrl, setUpgradeUrl] = useState<string | null>(null);

  if (!magnet) {
    setLocation("/dashboard");
    return null;
  }

  const publicUrl = `${window.location.origin}/p/${magnet.slug}`;
  const usingCustom = deliveryEnabled && mode === "custom";

  const publish = async () => {
    setPublishing(true);
    setPublishError(null);
    setUpgradeUrl(null);
    const delivery = {
      deliveryEmailEnabled: deliveryEnabled,
      deliveryEmailSubject: usingCustom ? subject : null,
      deliveryEmailBody: usingCustom ? body : null,
    };

    try {
      updateMagnet(magnet.id, {
        status: "published",
        ...delivery,
      });
      const updated = await updateLeadMagnetStatusInSupabase(magnet.id, "published", delivery);
      if (usingCustom && !updated?.delivery_email_body) {
        throw new Error("Custom delivery email was not saved. Try publishing again.");
      }
      setLocation("/dashboard");
    } catch (error) {
      setPublishing(false);
      setPublishError(error instanceof Error ? error.message : "Could not publish lead magnet");
      setUpgradeUrl(error instanceof SendletApiError ? error.upgradeUrl ?? null : null);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
          <span className="text-foreground font-medium">Lead magnet</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">Delivery email</span>
          <ChevronRight className="h-3 w-3" />
          <span>Publish</span>
        </div>

        <div className="mb-7">
          <h1 className="text-2xl font-semibold tracking-tight">Set up delivery email</h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Sendlet can send a clean resource email automatically when someone opts in.
          </p>
        </div>

        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden mb-6">
          <div className="px-5 py-4 border-b flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Send the resource by email</p>
              <p className="text-xs text-muted-foreground mt-1">
                The thank-you page still shows the download button either way.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDeliveryEnabled((value) => !value)}
              className={`h-6 w-11 rounded-full p-0.5 transition-colors ${deliveryEnabled ? "bg-primary" : "bg-muted"}`}
              aria-pressed={deliveryEnabled}
            >
              <span className={`block h-5 w-5 rounded-full bg-white shadow transition-transform ${deliveryEnabled ? "translate-x-5" : ""}`} />
            </button>
          </div>

          {deliveryEnabled ? (
            <>
              <div className="p-5 border-b">
                <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted/40 p-1">
                  <button
                    type="button"
                    onClick={() => setMode("default")}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition ${mode === "default" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}
                  >
                    Clean default
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("custom")}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition ${mode === "custom" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}
                  >
                    Custom copy
                  </button>
                </div>
              </div>

              {mode === "default" ? (
                <div className="p-5 space-y-4">
                  <div className="rounded-xl border bg-background px-4 py-4">
                    <p className="text-xs text-muted-foreground mb-3">Preview</p>
                    <p className="text-sm text-muted-foreground">Your resource is ready.</p>
                    <h2 className="text-lg font-semibold leading-snug mt-3">{magnet.title}</h2>
                    {magnet.description ? (
                      <p className="text-sm text-muted-foreground leading-relaxed mt-2">{magnet.description}</p>
                    ) : null}
                    <div className="inline-flex rounded-lg bg-[#0A8CFF] px-4 py-2 text-sm font-semibold text-white mt-5">
                      Open resource
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Recommended for deliverability. No custom copy is saved for this lead magnet.
                  </p>
                </div>
              ) : (
                <>
                  <div className="px-5 py-4 border-b bg-primary/5">
                    <p className="text-sm font-medium text-foreground">
                      Sendlet adds the download link for you.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Put <span className="font-medium text-foreground">{"{{resource_link}}"}</span> where the download button should appear. If you leave it out, Sendlet adds the button at the end.
                    </p>
                  </div>

                  <div className="divide-y">
                    <div className="flex items-center px-5 py-3 gap-3">
                      <span className="w-16 text-xs font-medium text-muted-foreground shrink-0">Subject</span>
                      <input
                        value={subject}
                        onChange={(event) => setSubject(event.target.value)}
                        placeholder="Your subject line"
                        className="flex-1 text-sm font-medium text-foreground bg-transparent border-none outline-none placeholder:text-muted-foreground/50"
                      />
                    </div>
                  </div>

                  <div className="border-t px-5 py-4">
                    <textarea
                      value={body}
                      onChange={(event) => setBody(event.target.value)}
                      rows={12}
                      className="w-full text-sm text-foreground bg-transparent border-none outline-none resize-none leading-relaxed placeholder:text-muted-foreground/50"
                      placeholder="Write the message people receive after opting in. Sendlet will add the resource link."
                    />
                  </div>

                  <div className="border-t bg-muted/30 px-5 py-3">
                    <div className="inline-flex rounded-lg border bg-card px-3 py-2 text-xs font-medium text-muted-foreground">
                      {"{{resource_link}}"} = download button for the uploaded file or pasted link
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="p-5">
              <p className="text-sm text-muted-foreground">
                Email delivery is off. Leads will only get the resource from the thank-you page.
              </p>
            </div>
          )}
        </div>

        <div className="rounded-xl border bg-muted/20 px-4 py-3 mb-6 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground">Live page</p>
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline truncate flex items-center gap-1 mt-1"
            >
              {publicUrl}
              <ExternalLink className="h-3 w-3 shrink-0" />
            </a>
          </div>
        </div>

        {publishError ? (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <p>{publishError}</p>
            {upgradeUrl ? (
              <a href={upgradeUrl} className="mt-2 inline-flex font-semibold underline">
                Upgrade beta access
              </a>
            ) : null}
          </div>
        ) : null}

        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={() => setLocation("/dashboard")} disabled={publishing}>
            Save draft
          </Button>
          <Button onClick={publish} disabled={publishing || (usingCustom && !subject.trim())} className="gap-1.5">
            <Send className="h-3.5 w-3.5" />
            {publishing ? "Publishing..." : "Publish"}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
