import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { leads, leadMagnets } from "@/data/mock";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, Search, Send } from "lucide-react";
import { Link } from "wouter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function SourcePill({ source }: { source: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs border bg-muted/60 text-muted-foreground font-normal">
      {source}
    </span>
  );
}

export default function Leads() {
  const [search, setSearch] = useState("");

  const filteredLeads = leads.filter(
    (lead) =>
      lead.email.toLowerCase().includes(search.toLowerCase()) ||
      lead.leadMagnet.toLowerCase().includes(search.toLowerCase())
  );

  const liveCount = leadMagnets.filter((m) => m.status === "published").length;

  return (
    <AppLayout>
      <div className="container max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {leads.length > 0
                ? `${leads.length} leads captured across ${liveCount} published ${liveCount === 1 ? "page" : "pages"}.`
                : "All contacts captured across your resources."}
            </p>
          </div>
          <Button variant="outline" disabled={leads.length === 0} className="shrink-0">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {leads.length === 0 ? (
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
                    <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Resource</TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Source</TableHead>
                    <TableHead className="text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Date captured</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-10 text-sm text-muted-foreground">
                        No leads match your search.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLeads.map((lead) => (
                      <TableRow key={lead.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="py-4 font-medium text-sm">{lead.email}</TableCell>
                        <TableCell className="py-4 text-sm text-muted-foreground">{lead.leadMagnet}</TableCell>
                        <TableCell className="py-4">
                          <SourcePill source={lead.source} />
                        </TableCell>
                        <TableCell className="py-4 text-right text-sm text-muted-foreground tabular-nums">
                          {lead.createdAt}
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
