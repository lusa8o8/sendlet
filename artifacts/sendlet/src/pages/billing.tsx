import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { Check, CreditCard, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { fetchDashboardData, type WorkspaceSummary } from "@/services/sendlet-service";
import { openPaddleCheckout, paddlePlans, type PaddlePlan } from "@/lib/paddle";

function formatDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function planFromWorkspace(workspace: WorkspaceSummary | null): PaddlePlan | null {
  const plan = workspace?.plan?.toLowerCase() ?? "";
  if (plan.includes("agency")) return "agency";
  if (plan.includes("pro")) return "pro";
  if (plan.includes("starter")) return "starter";
  return null;
}

export default function BillingPage() {
  const { email } = useAuth();
  const { toast } = useToast();
  const [workspace, setWorkspace] = useState<WorkspaceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [checkoutPlan, setCheckoutPlan] = useState<PaddlePlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentPlan = planFromWorkspace(workspace);
  const checkoutSuccess = useMemo(() => {
    return new URLSearchParams(window.location.search).get("checkout") === "success";
  }, []);

  useEffect(() => {
    fetchDashboardData()
      .then((data) => setWorkspace(data.workspace))
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load billing"))
      .finally(() => setIsLoading(false));
  }, []);

  const startCheckout = async (plan: PaddlePlan) => {
    if (!workspace?.id) {
      toast({
        title: "Create a workspace first",
        description: "Publish or save a lead magnet before starting checkout.",
        variant: "destructive",
      });
      return;
    }

    setCheckoutPlan(plan);
    try {
      await openPaddleCheckout(plan, { workspaceId: workspace.id, email });
    } catch (err) {
      toast({
        title: "Could not open checkout",
        description: err instanceof Error ? err.message : "Check the Paddle env vars and try again.",
        variant: "destructive",
      });
    } finally {
      setCheckoutPlan(null);
    }
  };

  return (
    <AppLayout>
      <main className="mx-auto max-w-5xl px-6 py-10 pb-24">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">Billing</p>
            <h1 className="text-3xl font-semibold tracking-tight">Choose a Sendlet plan</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Start lean, upgrade when your lead magnet workflow needs more pages, leads, and delivery volume.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
        </div>

        {checkoutSuccess && (
          <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
            Checkout completed. Your plan will update as soon as Paddle sends the billing event.
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <section className="mb-8 rounded-xl border bg-card p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold">Current workspace</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {isLoading ? "Loading..." : workspace?.name ?? "No workspace yet"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="rounded-full capitalize">
                {(workspace?.plan ?? "free").replace(/_/g, " ")}
              </Badge>
              <Badge variant={workspace?.billingStatus === "active" ? "default" : "outline"} className="rounded-full capitalize">
                {workspace?.billingStatus ?? "free"}
              </Badge>
            </div>
          </div>
          {workspace?.currentPeriodEndsAt && (
            <p className="mt-4 text-xs text-muted-foreground">
              Current billing period ends {formatDate(workspace.currentPeriodEndsAt)}.
            </p>
          )}
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {(Object.keys(paddlePlans) as PaddlePlan[]).map((key) => {
            const plan = paddlePlans[key];
            const isCurrent = currentPlan === key && workspace?.billingStatus === "active";
            const isBusy = checkoutPlan === key;

            return (
              <article
                key={plan.key}
                className={`rounded-xl border bg-card p-5 ${key === "pro" ? "border-primary shadow-sm" : ""}`}
              >
                <div className="mb-5">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold">{plan.name}</h2>
                    {isCurrent && <Badge className="rounded-full">Current</Badge>}
                  </div>
                  <p className="mt-2 text-3xl font-semibold">{plan.price}</p>
                  <p className="text-sm text-muted-foreground">per month</p>
                  <p className="mt-4 text-sm text-muted-foreground">{plan.description}</p>
                </div>

                <ul className="mb-6 space-y-2 text-sm">
                  {plan.limits.map((limit) => (
                    <li key={limit} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span>{limit}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={key === "pro" ? "default" : "outline"}
                  disabled={isBusy || isCurrent}
                  onClick={() => startCheckout(key)}
                >
                  {isBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
                  {isCurrent ? "Current plan" : `Choose ${plan.name}`}
                </Button>
              </article>
            );
          })}
        </section>

        <p className="mt-8 text-sm text-muted-foreground">
          Need to cancel, change billing details, or fix a payment issue? Email{" "}
          <a className="text-primary hover:underline" href="mailto:support@sendlet.trymyapp.uk">
            support@sendlet.trymyapp.uk
          </a>
          . A self-serve customer portal can come after beta usage proves the flow.
        </p>
      </main>
    </AppLayout>
  );
}
