import { useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, Search, Send } from "lucide-react";
import { Link } from "wouter";
import { fetchLeadsData, type WorkspaceLead } from "@/services/sendlet-service";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const LEADS_CACHE_KEY = "sendlet_leads_data";

function SourcePill({ source }: { source: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs border bg-muted/60 text-muted-foreground font-normal">
      {source}
    </span>
  );
}

function csvCell(value: string | number | null | undefined) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function downloadCsv(filename: string, rows: Array<Array<string | number | null | undefined>>) {
  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function Leads() {
  const [search, setSearch] = useState("");
  const [leads, setLeads] = useState<WorkspaceLead[]>([]);
  const [publishedCount, setPublishedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setError(null);
    try {
      const data = await fetchLeadsData();
      setLeads(data.leads);
      setPublishedCount(data.publishedCount);
      sessionStorage.setItem(LEADS_CACHE_KEY, JSON.stringify(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load leads");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let hasCachedLeads = false;
    try {
      const cached = sessionStorage.getItem(LEADS_CACHE_KEY);
      if (cached) {
        const data = JSON.parse(cached) as { leads: WorkspaceLead[]; publishedCount: number };
        setLeads(data.leads);
        setPublishedCount(data.publishedCount);
        setIsLoading(false);
        hasCachedLeads = true;
      }
    } catch {}
    void loadData(!hasCachedLeads);
  }, []);

  const filteredLeads = useMemo(
    () =>
      leads.filter((lead) => {
        const query = search.toLowerCase();
        return (
          lead.email.toLowerCase().includes(query) ||
          lead.name?.toLowerCase().includes(query) ||
          lead.leadMagnet.toLowerCase().includes(query)
        );
      }),
    [leads, search],
  );

  const exportCsv = (rowsToExport: WorkspaceLead[], scope: "all" | "filtered") => {
    const rows = [
      ["Email", "Name", "Resource", "Resource slug", "Source", "Referrer", "Delivered at", "Date captured"],
      ...rowsToExport.map((lead) => [
        lead.email,
        lead.name ?? "",
        lead.leadMagnet,
        lead.leadMagnetSlug,
        lead.source,
        lead.referrer ?? "",
        lead.deliveredAt ?? "",
        lead.createdAt,
      ]),
    ];
    downloadCsv(`sendlet-leads-${scope}.csv`, rows);
  };

  return (
    <AppLayout>
      <div className="container max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isLoading
                ? "Loading captured contacts..."
                : leads.length > 0
                ? `${leads.length} leads captured across ${publishedCount} published ${publishedCount === 1 ? "page" : "pages"}.`
                : "All contacts captured across your resources."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {error && (
              <Button variant="outline" className="shrink-0" onClick={() => loadData()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            )}
            <Button
              variant="outline"
              disabled={filteredLeads.length === 0}
              className="shrink-0"
              onClick={() => exportCsv(filteredLeads, "filtered")}
            >
              <Download className="mr-2 h-4 w-4" />
              Export filtered
            </Button>
            <Button
              variant="outline"
              disabled={leads.length === 0}
              className="shrink-0"
              onClick={() => exportCsv(leads, "all")}
            >
              <Download className="mr-2 h-4 w-4" />
              Export all
            </Button>
          </div>
        </div>

        {error ? (
          <div className="border rounded-lg p-10 bg-card text-center">
            <h3 className="text-base font-medium">Could not load leads</h3>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </div>
        ) : isLoading ? (
          <div className="border rounded-lg p-10 bg-card text-center text-sm text-muted-foreground">
            Loading leads...
          </div>
        ) : leads.length === 0 ? (
          <div className="border border-dashed rounded-lg p-16 text-center bg-card flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Send className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-medium">No leads yet</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Share your opt-in page to start collecting emails. They'll appear here.
              </p>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search emails or resources…"
                className="pl-9 h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="border rounded-lg bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b">
                    <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Email</TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Name</TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Resource</TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Source</TableHead>
                    <TableHead className="text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Date captured</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-sm text-muted-foreground">
                        No leads match your search.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLeads.map((lead) => (
                      <TableRow key={lead.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="py-4 font-medium text-sm">{lead.email}</TableCell>
                        <TableCell className="py-4 text-sm text-muted-foreground">{lead.name ?? "—"}</TableCell>
                        <TableCell className="py-4 text-sm text-muted-foreground">{lead.leadMagnet}</TableCell>
                        <TableCell className="py-4">
                          <SourcePill source={lead.source} />
                        </TableCell>
                        <TableCell className="py-4 text-right text-sm text-muted-foreground tabular-nums">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
