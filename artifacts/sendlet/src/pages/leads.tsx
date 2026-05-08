import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { leads } from "@/data/mock";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, Search, Mail } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Leads() {
  const [search, setSearch] = useState("");
  
  const filteredLeads = leads.filter(lead => 
    lead.email.toLowerCase().includes(search.toLowerCase()) ||
    lead.leadMagnet.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="container max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
            <p className="text-muted-foreground text-sm mt-1">All contacts captured across your resources.</p>
          </div>
          <Button variant="outline" disabled={leads.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {leads.length === 0 ? (
          <div className="border border-dashed rounded-lg p-12 text-center bg-card flex flex-col items-center justify-center">
            <div className="bg-muted h-12 w-12 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No leads yet</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Share your opt-in page to start collecting emails.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search emails or resources..." 
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="border rounded-lg bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead className="text-right">Date captured</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No leads match your search.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLeads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium">{lead.email}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{lead.leadMagnet}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{lead.source}</TableCell>
                        <TableCell className="text-right text-muted-foreground text-sm">{lead.createdAt}</TableCell>
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
