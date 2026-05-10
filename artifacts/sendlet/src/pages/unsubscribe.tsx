import { useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { unsubscribeLead } from "@/services/sendlet-service";

export default function UnsubscribePage() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const email = params.get("email") ?? "";
  const magnetId = params.get("magnet") ?? "";
  const [status, setStatus] = useState<"idle" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const submit = async () => {
    setStatus("idle");
    try {
      await unsubscribeLead(email, magnetId);
      setStatus("done");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Could not unsubscribe this email.");
    }
  };

  return (
    <main className="min-h-[100dvh] bg-background flex items-center justify-center px-4">
      <section className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-sm">
        {status === "done" ? (
          <div className="text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-primary mb-4" />
            <h1 className="text-xl font-semibold tracking-tight">You're unsubscribed</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {email ? `${email} will no longer receive this resource email.` : "This email will no longer receive this resource email."}
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-semibold tracking-tight">Unsubscribe</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Stop delivery emails for this Sendlet resource.
            </p>
            {email ? (
              <p className="mt-5 rounded-xl border bg-muted/30 px-3 py-2 text-sm">{email}</p>
            ) : null}
            {status === "error" ? (
              <p className="mt-4 rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {message}
              </p>
            ) : null}
            <Button className="mt-5 w-full" onClick={submit} disabled={!email || !magnetId}>
              Unsubscribe
            </Button>
          </>
        )}
      </section>
    </main>
  );
}
