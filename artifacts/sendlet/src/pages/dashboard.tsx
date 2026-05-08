import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { leadMagnets } from "@/data/mock";
import { AppLayout } from "@/components/layout/app-layout";
import { Plus, Copy, Eye, Edit2, BarChart3 } from "lucide-react";
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

export default function Dashboard() {
  const { toast } = useToast();

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/p/${slug}`);
    toast({
      title: "Link copied",
      description: "The public link has been copied to your clipboard.",
    });
  };

  return (
    <AppLayout>
      <div className="container max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage your lead magnets and monitor performance.</p>
          </div>
          <Button asChild>
            <Link href="/lead-magnets/new" data-testid="button-create-lead-magnet">
              <Plus className="mr-2 h-4 w-4" />
              Create lead magnet
            </Link>
          </Button>
        </div>

        {leadMagnets.length === 0 ? (
          <div className="border border-dashed rounded-lg p-12 text-center bg-card flex flex-col items-center justify-center">
            <div className="bg-muted h-12 w-12 rounded-full flex items-center justify-center mb-4">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">Create your first lead magnet</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
              Add a resource, write a short opt-in page, and publish a shareable link.
            </p>
            <Button asChild>
              <Link href="/lead-magnets/new">Create lead magnet</Link>
            </Button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="border rounded-lg bg-card overflow-hidden"
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Resource</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Visits</TableHead>
                  <TableHead className="text-right">Leads</TableHead>
                  <TableHead className="text-right">Conv. Rate</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leadMagnets.map((magnet) => (
                  <TableRow key={magnet.id}>
                    <TableCell className="font-medium">
                      <Link href={`/lead-magnets/${magnet.id}`} className="hover:underline">
                        {magnet.title}
                      </Link>
                      <div className="text-xs text-muted-foreground font-normal mt-0.5 hidden sm:block">
                        /p/{magnet.slug}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={magnet.status === "published" ? "default" : magnet.status === "draft" ? "secondary" : "outline"}
                        className="rounded-full font-normal"
                      >
                        {magnet.status.charAt(0).toUpperCase() + magnet.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{magnet.visits}</TableCell>
                    <TableCell className="text-right">{magnet.leads}</TableCell>
                    <TableCell className="text-right">{magnet.conversionRate}%</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => copyLink(magnet.slug)}
                          title="Copy link"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          asChild
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          title="Preview"
                        >
                          <Link href={`/p/${magnet.slug}`}>
                            <Eye className="h-4 w-4" />
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
                            <Edit2 className="h-4 w-4" />
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
