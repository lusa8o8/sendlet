import { useParams, Link } from "wouter";
import { AppLayout } from "@/components/layout/app-layout";
import { leadMagnets, leads } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy, Download, ExternalLink, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
        Paused
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-muted-foreground border bg-background">
      Draft
    </span>
  );
}

function MiniOptInPreview({ magnet }: { magnet: typeof leadMagnets[0] }) {
  return (
    <div className="bg-background rounded-lg border overflow-hidden">
      {/* Creator identity */}
      <div className="flex flex-col items-center pt-5 pb-4 px-4">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white mb-1.5"
          style={{ backgroundColor: magnet.accentColor }}
        >
          S
        </div>
        <p className="text-xs text-muted-foreground">Sarah Chen</p>
      </div>
      {/* Card */}
      <div className="mx-3 mb-3 bg-card border rounded-lg overflow-hidden shadow-sm">
        <div className="h-1.5 w-full" style={{ backgroundColor: magnet.accentColor }} />
        <div className="p-4 space-y-3">
          <div>
            <p className="text-sm font-semibold leading-tight">{magnet.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{magnet.description}</p>
          </div>
          <div className="space-y-1.5">
            {["Step-by-step process", "Ready-to-use templates"].map((b) => (
              <div key={b} className="flex items-center gap-1.5">
                <div
                  className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${magnet.accentColor}20` }}
                >
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: magnet.accentColor }} />
                </div>
                <p className="text-xs text-muted-foreground">{b}</p>
              </div>
            ))}
          </div>
          <div className="pt-2 border-t space-y-2">
            <div className="h-7 w-full bg-muted rounded" />
            <div
              className="h-7 w-full rounded flex items-center justify-center"
              style={{ backgroundColor: magnet.accentColor }}
            >
              <span className="text-xs font-medium text-white">Get the resource</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LeadMagnetDetail() {
  const { id } = useParams();
  const { toast } = useToast();

  const magnet = leadMagnets.find((m) => m.id === id) || leadMagnets[0];
  const magnetLeads = leads.filter((l) => l.leadMagnet === magnet.title);

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/p/${magnet.slug}`);
    toast({ title: "Link copied", description: "The public link is on your clipboard." });
  };

  return (
    <AppLayout>
      <div className="container max-w-5xl mx-auto px-6 py-10">
        {/* Back */}
        <Button variant="ghost" size="sm" asChild className="text-muted-foreground mb-6 -ml-2">
          <Link href="/dashboard">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Dashboard
          </Link>
        </Button>

        {/* Title row */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
          <div className="space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-semibold tracking-tight">{magnet.title}</h1>
              <StatusBadge status={magnet.status} />
            </div>
            <p className="text-sm text-muted-foreground">/p/{magnet.slug}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button variant="ghost" size="sm" onClick={copyLink}>
              <Copy className="mr-1.5 h-4 w-4" />
              Copy link
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/p/${magnet.slug}`}>
                <ExternalLink className="mr-1.5 h-4 w-4" />
                Preview
              </Link>
            </Button>
            <Button size="sm">
              <Settings className="mr-1.5 h-4 w-4" />
              Edit
            </Button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <StatCard
            label="Page visits"
            value={magnet.visits.toLocaleString()}
            context={magnet.weeklyVisits > 0 ? `+${magnet.weeklyVisits} this week` : "No visits this week"}
            contextPositive={magnet.weeklyVisits > 0}
          />
          <StatCard
            label="Leads captured"
            value={magnet.leads}
            context={magnet.weeklyLeads > 0 ? `+${magnet.weeklyLeads} this week` : "None this week"}
            contextPositive={magnet.weeklyLeads > 0}
          />
          <StatCard
            label="Conversion rate"
            value={magnet.conversionRate > 0 ? `${magnet.conversionRate}%` : "—"}
            context="Industry avg ~20%"
            contextPositive={magnet.conversionRate >= 20}
          />
        </div>

        {/* Leads + Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Recent leads</h2>
              <Button variant="outline" size="sm" disabled={magnetLeads.length === 0}>
                <Download className="mr-1.5 h-4 w-4" />
                Export CSV
              </Button>
            </div>

            {magnetLeads.length === 0 ? (
              <div className="border border-dashed rounded-lg p-10 text-center bg-card">
                <p className="text-sm text-muted-foreground">
                  No leads yet. Share your link to start collecting!
                </p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden bg-card">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-b">
                      <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Email</TableHead>
                      <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Source</TableHead>
                      <TableHead className="text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {magnetLeads.map((lead) => (
                      <TableRow key={lead.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="py-3.5 font-medium text-sm">{lead.email}</TableCell>
                        <TableCell className="py-3.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs border bg-muted/60 text-muted-foreground">
                            {lead.source}
                          </span>
                        </TableCell>
                        <TableCell className="py-3.5 text-right text-sm text-muted-foreground tabular-nums">
                          {lead.createdAt}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h2 className="text-base font-semibold">Preview</h2>
            <MiniOptInPreview magnet={magnet} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
