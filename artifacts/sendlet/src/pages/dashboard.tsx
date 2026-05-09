import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { leadMagnets, broadcasts } from "@/data/mock";
import { PROVIDERS, integrationConnections } from "@/data/integrations";
import { AppLayout } from "@/components/layout/app-layout";
import { Plus, Copy, Eye, Edit2, Send, TrendingUp, ChevronRight, Radio } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import type { LeadMagnet } from "@/data/mock";

const BROADCAST_PROVIDER_IDS = ["resend", "kit", "mailchimp", "beehiiv"];

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
            {magnet.visits > 0 ? magnet.visits.toLocaleString() : <span className="text-muted-foreground">—</span>}
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
              <span className="text-muted-foreground">—</span>
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

/* ── Broadcasts sheet ────────────────────────────────────────── */

function BroadcastsSheet({
  open,
  onClose,
  sendTarget,
}: {
  open: boolean;
  onClose: () => void;
  sendTarget?: LeadMagnet;
}) {
  const hasEmailProvider = BROADCAST_PROVIDER_IDS.some((id) => !!integrationConnections[id]);
  const recentBroadcasts = broadcasts.slice(0, 10);

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[80vh] overflow-y-auto">
        <SheetHeader className="flex flex-row items-center justify-between pb-4 border-b mb-1">
          <SheetTitle className="text-base">Broadcasts</SheetTitle>
          {sendTarget && (
            <Button size="sm" variant="outline" asChild onClick={onClose}>
              <Link href={`/lead-magnets/${sendTarget.id}/email`}>
                <Send className="mr-1.5 h-3.5 w-3.5" />
                New email
              </Link>
            </Button>
          )}
        </SheetHeader>

        {recentBroadcasts.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-muted-foreground mb-4">No emails sent yet.</p>
            {!hasEmailProvider ? (
              <Button variant="outline" size="sm" asChild onClick={onClose}>
                <Link href="/settings/integrations">Connect an email tool to start →</Link>
              </Button>
            ) : sendTarget ? (
              <Button size="sm" asChild onClick={onClose}>
                <Link href={`/lead-magnets/${sendTarget.id}/email`}>Send your first email →</Link>
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="divide-y">
            {recentBroadcasts.map((bc) => {
              const provider = PROVIDERS.find((p) => p.id === bc.provider);
              const magnet = leadMagnets.find((m) => m.id === bc.magnetId);
              return (
                <div key={bc.id} className="flex items-center py-3.5 gap-3">
                  {provider && (
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0"
                      style={{ backgroundColor: provider.brandColor, color: "#fff" }}
                    >
                      {provider.initials}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{bc.subject}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {bc.sentAt} · {bc.recipientCount} recipients
                      {magnet && <> · {magnet.title}</>}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

/* ── Floating action button ──────────────────────────────────── */

function FAB({ onBroadcasts }: { onBroadcasts: () => void }) {
  const [open, setOpen] = useState(false);
  const publishedMagnets = leadMagnets.filter((m) => m.status === "published");
  const sendTarget = publishedMagnets[0];

  const items: { label: string; Icon: React.ElementType; href?: string; onClick?: () => void }[] = [
    {
      label: "Broadcasts",
      Icon: Radio,
      onClick: () => { setOpen(false); onBroadcasts(); },
    },
    ...(sendTarget
      ? [{ label: "Send email", Icon: Send, href: `/lead-magnets/${sendTarget.id}/email` }]
      : []),
    { label: "New lead magnet", Icon: Plus, href: "/lead-magnets/upload" },
  ];

  return (
    <div className="fixed bottom-6 right-4 sm:right-6 z-50 flex flex-col items-end gap-2.5">
      <AnimatePresence>
        {open &&
          items.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.95 }}
              transition={{ delay: i * 0.04, duration: 0.15 }}
            >
              {item.href ? (
                <Link href={item.href} onClick={() => setOpen(false)}>
                  <div className="flex items-center gap-2 bg-card border shadow-lg rounded-full h-10 px-4 text-sm font-medium hover:bg-muted transition-colors whitespace-nowrap cursor-pointer">
                    <item.Icon className="h-3.5 w-3.5 text-primary shrink-0" />
                    {item.label}
                  </div>
                </Link>
              ) : (
                <button
                  onClick={item.onClick}
                  className="flex items-center gap-2 bg-card border shadow-lg rounded-full h-10 px-4 text-sm font-medium hover:bg-muted transition-colors whitespace-nowrap"
                >
                  <item.Icon className="h-3.5 w-3.5 text-primary shrink-0" />
                  {item.label}
                </button>
              )}
            </motion.div>
          ))}
      </AnimatePresence>

      {open && <div className="fixed inset-0 -z-10" onClick={() => setOpen(false)} />}

      <motion.button
        className="w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
        onClick={() => setOpen((o) => !o)}
        whileTap={{ scale: 0.92 }}
      >
        <motion.div animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.18 }}>
          <Plus className="h-5 w-5" />
        </motion.div>
      </motion.button>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────── */

export default function Dashboard() {
  const { toast } = useToast();
  const { name } = useAuth();
  const [broadcastsOpen, setBroadcastsOpen] = useState(false);

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

  const publishedMagnets = leadMagnets.filter((m) => m.status === "published");
  const sendTarget = publishedMagnets[0];

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

        {/* Page header */}
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

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-7">
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
            label="Avg. conv."
            value={avgConv > 0 ? `${avgConv}%` : "—"}
            context="Industry ~20%"
            contextPositive={avgConv >= 20}
          />
        </div>

        {/* Lead magnets */}
        {leadMagnets.length === 0 ? (
          emptyState
        ) : (
          <>
            {/* Mobile card list */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-3 sm:hidden"
            >
              {leadMagnets.map((magnet) => (
                <MagnetCard key={magnet.id} magnet={magnet} onCopy={copyLink} />
              ))}
            </motion.div>

            {/* Desktop table */}
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
                  {leadMagnets.map((magnet) => (
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
                        {magnet.visits > 0 ? magnet.visits.toLocaleString() : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="text-right py-4 text-sm tabular-nums">
                        {magnet.leads > 0 ? (
                          <span className="flex items-center justify-end gap-1.5">
                            {magnet.leads}
                            {magnet.weeklyLeads > 0 && <TrendingUp className="h-3 w-3 text-primary" />}
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

      <FAB onBroadcasts={() => setBroadcastsOpen(true)} />

      <BroadcastsSheet
        open={broadcastsOpen}
        onClose={() => setBroadcastsOpen(false)}
        sendTarget={sendTarget}
      />
    </AppLayout>
  );
}
