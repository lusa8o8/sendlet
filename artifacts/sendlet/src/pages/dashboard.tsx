import { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/layout/app-layout";
import { Plus, Copy, Eye, Edit2, Send, TrendingUp, ChevronRight, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import type { LeadMagnet } from "@/data/mock";
import { fetchDashboardData, type WorkspaceSummary } from "@/services/sendlet-service";

const DASHBOARD_CACHE_KEY = "sendlet_dashboard_magnets";
const DASHBOARD_WORKSPACE_CACHE_KEY = "sendlet_dashboard_workspace";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatLimit(value: number | undefined, fallback: number) {
  return (value ?? fallback).toLocaleString();
}

function StatCard({
  label,
  value,
  context,
  contextPositive,
}: {
  label: string;
  value: string | number;
  context?: string;
  contextPositive?: boolean;
}) {
  return (
    <div className="bg-card border rounded-xl p-5 space-y-1">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-3xl font-semibold tracking-tight">{value}</p>
      {context && (
        <p className={`text-xs ${contextPositive ? "text-primary" : "text-muted-foreground"}`}>
          {context}
        </p>
      )}
    </div>
  );
}

function BetaAccessCard({ workspace, liveCount }: { workspace: WorkspaceSummary | null; liveCount: number }) {
  const pageLimit = workspace?.leadMagnetLimit ?? 3;
  const leadLimit = workspace?.monthlyLeadLimit ?? 250;
  const emailLimit = workspace?.monthlyEmailLimit ?? 250;
  const fileLimitMb = Math.round((workspace?.fileSizeLimit ?? 10_485_760) / 1_048_576);
  const planLabel = (workspace?.plan ?? "beta_free").replace(/_/g, " ");
  const nearPageLimit = liveCount >= Math.max(1, pageLimit - 1);

  return (
    <div className="mb-7 rounded-xl border bg-card p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold capitalize">{planLabel}</p>
            <Badge variant="outline" className="rounded-full font-normal">
              {workspace?.betaStatus ?? "active"}
            </Badge>
            {nearPageLimit ? (
              <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs text-amber-800">
                Near page limit
              </span>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">
            {formatLimit(pageLimit, 3)} live pages, {formatLimit(leadLimit, 250)} leads/month,
            {" "}{formatLimit(emailLimit, 250)} delivery emails/month, {fileLimitMb} MB uploads.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="shrink-0">
          <Link href="/billing">Manage plan</Link>
        </Button>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "published") {
    return (
      <Badge className="rounded-full font-normal text-xs bg-primary text-primary-foreground shrink-0">
        Published
      </Badge>
    );
  }
  if (status === "paused") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
        Paused
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium text-muted-foreground border bg-background shrink-0">
      Draft
    </span>
  );
}

function BlankValue() {
  return <span className="text-muted-foreground">-</span>;
}

function MagnetCard({ magnet, onCopy }: { magnet: LeadMagnet; onCopy: (slug: string) => void }) {
  return (
    <div className="bg-card border rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link
            href={`/lead-magnets/${magnet.id}`}
            className="font-medium text-sm hover:text-primary transition-colors line-clamp-2"
          >
            {magnet.title}
          </Link>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">/p/{magnet.slug}</p>
        </div>
        <StatusBadge status={magnet.status} />
      </div>

      <div className="flex items-center gap-4 text-sm">
        <div className="flex flex-col">
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Visits</span>
          <span className="font-medium tabular-nums">
            {magnet.visits > 0 ? magnet.visits.toLocaleString() : <BlankValue />}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Leads</span>
          <span className="font-medium tabular-nums flex items-center gap-1">
            {magnet.leads > 0 ? (
              <>
                {magnet.leads}
                {magnet.weeklyLeads > 0 && <TrendingUp className="h-3 w-3 text-primary" />}
              </>
            ) : (
              <BlankValue />
            )}
          </span>
        </div>
        {magnet.lastLead && (
          <div className="flex flex-col">
            <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Last lead</span>
            <span className="text-muted-foreground text-xs">{magnet.lastLead}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 pt-1 border-t">
        <Button
          variant="ghost" size="sm"
          className="h-9 px-3 text-xs text-muted-foreground gap-1.5 flex-1"
          onClick={() => onCopy(magnet.slug)}
        >
          <Copy className="h-3.5 w-3.5" />
          Copy link
        </Button>
        <Button variant="ghost" size="sm" className="h-9 px-3 text-xs text-muted-foreground gap-1.5 flex-1" asChild>
          <Link href={`/p/${magnet.slug}`}>
            <Eye className="h-3.5 w-3.5" />
            Preview
          </Link>
        </Button>
        <Button variant="ghost" size="sm" className="h-9 px-3 text-xs text-muted-foreground gap-1.5 flex-1" asChild>
          <Link href={`/lead-magnets/${magnet.id}/edit`}>
            <Edit2 className="h-3.5 w-3.5" />
            Edit
          </Link>
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground" asChild>
          <Link href={`/lead-magnets/${magnet.id}`}>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { toast } = useToast();
  const { name } = useAuth();
  const [workspace, setWorkspace] = useState<WorkspaceSummary | null>(null);
  const [magnets, setMagnets] = useState<LeadMagnet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const firstName = name.split(" ")[0];

  const loadData = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setError(null);
    try {
      const data = await fetchDashboardData();
      setWorkspace(data.workspace);
      setMagnets(data.magnets);
      sessionStorage.setItem(DASHBOARD_CACHE_KEY, JSON.stringify(data.magnets));
      sessionStorage.setItem(DASHBOARD_WORKSPACE_CACHE_KEY, JSON.stringify(data.workspace));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let hasCachedDashboard = false;
    try {
      const cachedMagnets = sessionStorage.getItem(DASHBOARD_CACHE_KEY);
      const cachedWorkspace = sessionStorage.getItem(DASHBOARD_WORKSPACE_CACHE_KEY);
      if (cachedMagnets) {
        setMagnets(JSON.parse(cachedMagnets) as LeadMagnet[]);
        setWorkspace(cachedWorkspace ? (JSON.parse(cachedWorkspace) as WorkspaceSummary | null) : null);
        setIsLoading(false);
        hasCachedDashboard = true;
      }
    } catch {}
    void loadData(!hasCachedDashboard);
  }, []);

  const totalLeads = magnets.reduce((a, m) => a + m.leads, 0);
  const weeklyLeads = magnets.reduce((a, m) => a + m.weeklyLeads, 0);
  const liveCount = magnets.filter((m) => m.status === "published").length;
  const draftCount = magnets.filter((m) => m.status !== "published").length;
  const magnetsWithVisits = magnets.filter((m) => m.visits > 0);
  const avgConv =
    magnetsWithVisits.length > 0
      ? Math.round(magnetsWithVisits.reduce((a, m) => a + m.conversionRate, 0) / magnetsWithVisits.length)
      : 0;

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/p/${slug}`);
    toast({ title: "Link copied", description: "The public link is on your clipboard." });
  };

  const emptyState = (
    <div className="border border-dashed rounded-xl p-12 text-center bg-card flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
        <Send className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="space-y-1.5">
        <h3 className="text-base font-medium">No lead magnets yet</h3>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          Create your first one to start publishing and collecting leads.
        </p>
      </div>
      <Button asChild size="sm">
        <Link href="/lead-magnets/upload">
          <Plus className="mr-2 h-4 w-4" />
          Create lead magnet
        </Link>
      </Button>
    </div>
  );

  return (
    <AppLayout>
      <div className="container max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 pb-24">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-7">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {getGreeting()}, {firstName}.
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <Button asChild className="shrink-0 w-full sm:w-auto">
            <Link href="/lead-magnets/upload" data-testid="button-create-lead-magnet">
              <Plus className="mr-2 h-4 w-4" />
              Create lead magnet
            </Link>
          </Button>
        </div>

        {error && (
          <div className="mb-6 flex items-center justify-between gap-3 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
            <p className="text-sm text-destructive">{error}</p>
            <Button size="sm" variant="outline" onClick={() => loadData()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        )}

        {!error && (
          <>
            <BetaAccessCard workspace={workspace} liveCount={liveCount} />

            <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-7">
              <StatCard
                label="Total leads"
                value={isLoading ? "..." : totalLeads}
                context={weeklyLeads > 0 ? `+${weeklyLeads} this week` : "None this week"}
                contextPositive={weeklyLeads > 0}
              />
              <StatCard
                label="Pages live"
                value={isLoading ? "..." : liveCount}
                context={draftCount > 0 ? `${draftCount} not published` : "All pages live"}
                contextPositive={draftCount === 0}
              />
              <StatCard
                label="Avg. conv."
                value={isLoading ? "..." : avgConv > 0 ? `${avgConv}%` : "-"}
                context="Visits next"
                contextPositive={avgConv >= 20}
              />
            </div>
          </>
        )}

        {isLoading ? (
          <div className="border rounded-xl p-10 bg-card text-center text-sm text-muted-foreground">
            Loading dashboard...
          </div>
        ) : error ? null : magnets.length === 0 ? (
          emptyState
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-3 sm:hidden"
            >
              {magnets.map((magnet) => (
                <MagnetCard key={magnet.id} magnet={magnet} onCopy={copyLink} />
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="hidden sm:block border rounded-xl bg-card overflow-hidden"
            >
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b">
                    <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Resource</TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</TableHead>
                    <TableHead className="text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Visits</TableHead>
                    <TableHead className="text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Leads</TableHead>
                    <TableHead className="text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Last lead</TableHead>
                    <TableHead className="text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {magnets.map((magnet) => (
                    <TableRow key={magnet.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="py-4">
                        <Link
                          href={`/lead-magnets/${magnet.id}`}
                          className="font-medium text-sm hover:text-primary transition-colors"
                        >
                          {magnet.title}
                        </Link>
                        <div className="text-xs text-muted-foreground font-normal mt-0.5">
                          /p/{magnet.slug}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <StatusBadge status={magnet.status} />
                      </TableCell>
                      <TableCell className="text-right py-4 text-sm tabular-nums">
                        {magnet.visits > 0 ? magnet.visits.toLocaleString() : <BlankValue />}
                      </TableCell>
                      <TableCell className="text-right py-4 text-sm tabular-nums">
                        {magnet.leads > 0 ? (
                          <span className="flex items-center justify-end gap-1.5">
                            {magnet.leads}
                            {magnet.weeklyLeads > 0 && <TrendingUp className="h-3 w-3 text-primary" />}
                          </span>
                        ) : (
                          <BlankValue />
                        )}
                      </TableCell>
                      <TableCell className="text-right py-4 text-sm text-muted-foreground">
                        {magnet.lastLead ?? <BlankValue />}
                      </TableCell>
                      <TableCell className="text-right py-4">
                        <div className="flex items-center justify-end gap-0.5">
                          <Button
                            variant="ghost" size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => copyLink(magnet.slug)} title="Copy link"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-muted-foreground hover:text-foreground" title="View page">
                            <Link href={`/p/${magnet.slug}`}><Eye className="h-3.5 w-3.5" /></Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Edit">
                            <Link href={`/lead-magnets/${magnet.id}/edit`}><Edit2 className="h-3.5 w-3.5" /></Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </motion.div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
