import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { leadMagnets, leads } from "@/data/mock";
import { AppLayout } from "@/components/layout/app-layout";
import { Plus, Copy, Eye, Edit2, Send, TrendingUp } from "lucide-react";
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

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
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
    <div className="bg-card border rounded-lg p-6 space-y-1.5">
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

function StatusBadge({ status }: { status: string }) {
  if (status === "published") {
    return (
      <Badge className="rounded-full font-normal text-xs bg-primary text-primary-foreground">
        Published
      </Badge>
    );
  }
  if (status === "paused") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
        Paused
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium text-muted-foreground border bg-background">
      Draft
    </span>
  );
}

export default function Dashboard() {
  const { toast } = useToast();
  const { name } = useAuth();

  const firstName = name.split(" ")[0];

  const totalLeads = leadMagnets.reduce((a, m) => a + m.leads, 0);
  const weeklyLeads = leadMagnets.reduce((a, m) => a + m.weeklyLeads, 0);
  const liveCount = leadMagnets.filter((m) => m.status === "published").length;
  const draftCount = leadMagnets.filter((m) => m.status !== "published").length;
  const avgConv =
    leadMagnets.filter((m) => m.visits > 0).length > 0
      ? Math.round(
          leadMagnets.filter((m) => m.visits > 0).reduce((a, m) => a + m.conversionRate, 0) /
            leadMagnets.filter((m) => m.visits > 0).length
        )
      : 0;

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/p/${slug}`);
    toast({ title: "Link copied", description: "The public link is on your clipboard." });
  };

  return (
    <AppLayout>
      <div className="container max-w-5xl mx-auto px-6 py-10">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
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
          <Button asChild className="shrink-0">
            <Link href="/lead-magnets/new" data-testid="button-create-lead-magnet">
              <Plus className="mr-2 h-4 w-4" />
              Create lead magnet
            </Link>
          </Button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard
            label="Total leads"
            value={totalLeads}
            context={weeklyLeads > 0 ? `+${weeklyLeads} this week` : "None this week"}
            contextPositive={weeklyLeads > 0}
          />
          <StatCard
            label="Pages live"
            value={liveCount}
            context={draftCount > 0 ? `${draftCount} not published` : "All pages live"}
            contextPositive={draftCount === 0}
          />
          <StatCard
            label="Avg. conversion"
            value={avgConv > 0 ? `${avgConv}%` : "—"}
            context="Industry avg ~20%"
            contextPositive={avgConv >= 20}
          />
        </div>

        {/* Lead magnets table */}
        {leadMagnets.length === 0 ? (
          <div className="border border-dashed rounded-lg p-16 text-center bg-card flex flex-col items-center justify-center gap-4">
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
              <Link href="/lead-magnets/new">
                <Plus className="mr-2 h-4 w-4" />
                Create lead magnet
              </Link>
            </Button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="border rounded-lg bg-card overflow-hidden"
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
                {leadMagnets.map((magnet) => (
                  <TableRow key={magnet.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="py-4">
                      <Link
                        href={`/lead-magnets/${magnet.id}`}
                        className="font-medium text-sm hover:text-primary transition-colors"
                      >
                        {magnet.title}
                      </Link>
                      <div className="text-xs text-muted-foreground font-normal mt-0.5 hidden sm:block">
                        /p/{magnet.slug}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <StatusBadge status={magnet.status} />
                    </TableCell>
                    <TableCell className="text-right py-4 text-sm tabular-nums">
                      {magnet.visits > 0 ? magnet.visits.toLocaleString() : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-right py-4 text-sm tabular-nums">
                      {magnet.leads > 0 ? (
                        <span className="flex items-center justify-end gap-1.5">
                          {magnet.leads}
                          {magnet.weeklyLeads > 0 && (
                            <TrendingUp className="h-3 w-3 text-primary" />
                          )}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right py-4 text-sm text-muted-foreground">
                      {magnet.lastLead ?? <span>—</span>}
                    </TableCell>
                    <TableCell className="text-right py-4">
                      <div className="flex items-center justify-end gap-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => copyLink(magnet.slug)}
                          title="Copy link"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          title="View page"
                        >
                          <Link href={`/p/${magnet.slug}`}>
                            <Eye className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          title="Edit"
                        >
                          <Link href={`/lead-magnets/${magnet.id}`}>
                            <Edit2 className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
