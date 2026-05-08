import { useParams, Link } from "wouter";
import { AppLayout } from "@/components/layout/app-layout";
import { leadMagnets, leads } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy, Download, ExternalLink, Settings, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function LeadMagnetDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  
  const magnet = leadMagnets.find(m => m.id === id) || leadMagnets[0];
  const magnetLeads = leads.filter(l => l.leadMagnet === magnet.title);

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/p/${magnet.slug}`);
    toast({
      title: "Link copied",
      description: "The public link has been copied to your clipboard.",
    });
  };

  return (
    <AppLayout>
      <div className="container max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground mb-4 -ml-3">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-semibold tracking-tight">{magnet.title}</h1>
                <Badge 
                  variant={magnet.status === "published" ? "default" : "secondary"}
                  className="rounded-full font-normal mt-1"
                >
                  {magnet.status.charAt(0).toUpperCase() + magnet.status.slice(1)}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm flex items-center gap-2">
                /p/{magnet.slug}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={copyLink}>
                <Copy className="mr-2 h-4 w-4" />
                Copy link
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/p/${magnet.slug}`}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Preview
                </Link>
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Page visits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{magnet.visits}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Leads captured</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{magnet.leads}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Conversion rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{magnet.conversionRate}%</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent leads</h2>
              <Button variant="outline" size="sm" disabled={magnetLeads.length === 0}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
            
            {magnetLeads.length === 0 ? (
              <div className="border rounded-lg p-8 text-center text-muted-foreground text-sm bg-card">
                No leads yet. Share your link to start collecting!
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead className="text-right">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {magnetLeads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium">{lead.email}</TableCell>
                        <TableCell className="text-muted-foreground">{lead.source}</TableCell>
                        <TableCell className="text-right text-muted-foreground text-sm">{lead.createdAt}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-4">Preview</h2>
            <div className="border rounded-lg bg-card overflow-hidden shadow-sm">
              <div className="bg-muted p-4 border-b text-center">
                <div 
                  className="w-12 h-12 rounded-full mx-auto mb-3" 
                  style={{ backgroundColor: magnet.accentColor }} 
                />
                <h3 className="font-semibold text-sm">{magnet.title}</h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="h-2 w-3/4 bg-muted rounded-full"></div>
                <div className="h-2 w-full bg-muted rounded-full"></div>
                <div className="h-2 w-5/6 bg-muted rounded-full"></div>
                
                <div className="space-y-2 mt-4">
                  <div className="flex gap-2 items-center">
                    <div className="h-3 w-3 rounded-full bg-muted"></div>
                    <div className="h-2 w-1/2 bg-muted rounded-full"></div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="h-3 w-3 rounded-full bg-muted"></div>
                    <div className="h-2 w-2/3 bg-muted rounded-full"></div>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t space-y-3">
                  <div className="h-8 w-full bg-muted rounded-md"></div>
                  <div className="h-8 w-full rounded-md" style={{ backgroundColor: magnet.accentColor }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
