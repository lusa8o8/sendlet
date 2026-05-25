import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
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
  fetchAdminData,
  type AdminBillingEvent,
  type AdminData,
  type AdminFailedDelivery,
  type AdminWorkspace,
} from "@/services/sendlet-service";

function shortId(value: string | null | undefined) {
  if (!value) return "-";
  return value.length > 16 ? `${value.slice(0, 10)}...` : value;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function WorkspacesTable({ workspaces }: { workspaces: AdminWorkspace[] }) {
  return (
    <section className="rounded-xl border bg-card">
      <div className="border-b p-4">
        <h2 className="font-semibold">Workspaces</h2>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Workspace</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Billing</TableHead>
              <TableHead>Subscription</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workspaces.map((workspace) => (
              <TableRow key={workspace.id}>
                <TableCell className="font-medium">{workspace.name}</TableCell>
                <TableCell>{workspace.ownerEmail ?? "-"}</TableCell>
                <TableCell className="capitalize">{workspace.plan.replace(/_/g, " ")}</TableCell>
                <TableCell>
                  <Badge variant={workspace.billingStatus === "active" ? "default" : "outline"} className="rounded-full capitalize">
                    {workspace.billingStatus}
                  </Badge>
                </TableCell>
                <TableCell>{shortId(workspace.paddleSubscriptionId)}</TableCell>
                <TableCell>{formatDate(workspace.createdAt)}</TableCell>
              </TableRow>
            ))}
            {workspaces.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                  No workspaces yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

function BillingEventsTable({ events }: { events: AdminBillingEvent[] }) {
  return (
    <section className="rounded-xl border bg-card">
      <div className="border-b p-4">
        <h2 className="font-semibold">Recent billing events</h2>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Subscription</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell className="font-medium">{event.eventType}</TableCell>
                <TableCell>{shortId(event.paddleSubscriptionId)}</TableCell>
                <TableCell>{shortId(event.paddlePriceId)}</TableCell>
                <TableCell>
                  {event.errorMessage ? (
                    <Badge variant="destructive">Failed</Badge>
                  ) : (
                    <Badge variant="outline">Processed</Badge>
                  )}
                </TableCell>
                <TableCell>{formatDate(event.createdAt)}</TableCell>
              </TableRow>
            ))}
            {events.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                  No billing events yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

function FailedDeliveriesTable({ deliveries }: { deliveries: AdminFailedDelivery[] }) {
  return (
    <section className="rounded-xl border bg-card">
      <div className="border-b p-4">
        <h2 className="font-semibold">Failed deliveries</h2>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>To</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Error</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deliveries.map((delivery) => (
              <TableRow key={delivery.id}>
                <TableCell className="font-medium">{delivery.toEmail}</TableCell>
                <TableCell>{delivery.subject ?? "-"}</TableCell>
                <TableCell className="max-w-md truncate text-destructive">{delivery.errorMessage ?? "-"}</TableCell>
                <TableCell>{formatDate(delivery.createdAt)}</TableCell>
              </TableRow>
            ))}
            {deliveries.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                  No failed deliveries.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

export default function AdminPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAdminData()
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load admin"))
      .finally(() => setIsLoading(false));
  }, []);

  const activePaid = data?.workspaces.filter((workspace) => workspace.billingStatus === "active").length ?? 0;

  return (
    <AppLayout>
      <main className="mx-auto max-w-6xl px-6 py-10 pb-24">
        <div className="mb-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">Sendlet admin</p>
          <h1 className="text-3xl font-semibold tracking-tight">Operations snapshot</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Read-only billing, workspace, and delivery health for beta.
          </p>
        </div>

        {isLoading && (
          <div className="rounded-xl border bg-card p-10 text-center text-sm text-muted-foreground">
            Loading admin data...
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {data && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <MetricCard label="Workspaces" value={data.workspaces.length} />
              <MetricCard label="Active paid" value={activePaid} />
              <MetricCard label="Failed deliveries" value={data.failedDeliveries.length} />
            </div>
            <WorkspacesTable workspaces={data.workspaces} />
            <BillingEventsTable events={data.billingEvents} />
            <FailedDeliveriesTable deliveries={data.failedDeliveries} />
          </div>
        )}
      </main>
    </AppLayout>
  );
}
