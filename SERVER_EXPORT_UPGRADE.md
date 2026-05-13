# Server Export Upgrade

## Goal

Move lead export from browser-generated CSV to server-generated CSV before lead volume makes the current client-side approach feel slow or fragile.

This is an upgrade path, not an urgent rewrite.

## Current State

Today:

- `workspace-data` returns the lead dataset to the browser
- `artifacts/sendlet/src/pages/leads.tsx` filters leads in-memory
- CSV is built in the browser and downloaded with a Blob

This is fine for MVP volume because it is simple and cheap.

## When To Switch

Switch from client-side export to server-side export when any of these become true:

1. A workspace regularly exceeds `10,000` leads
2. The `Leads` page response payload starts getting heavy enough to feel slow on normal connections
3. Export/download begins freezing or lagging on mobile or lower-memory laptops
4. Users ask for:
   - export all without loading every row in the table
   - scheduled exports
   - very large CSVs
   - background export jobs

## Product Decision

Keep the current client-side export as the default for now.

Add a server-side export path as a second step, then later decide whether to:

- keep both
- or fully replace browser export

For Sendlet, keeping both is the practical path:

- browser export for small workspaces
- server export for larger workspaces

## Recommended UX

### Phase 1

On the `Leads` page:

- `Export filtered`
- `Export all`

Current implementation already supports these actions in the browser.

### Phase 2

When workspace size crosses a threshold:

- `Export filtered` can stay client-side
- `Export all` should move server-side

### Phase 3

For very large datasets:

- `Request export`
- background job prepares file
- user downloads when ready

This phase is only needed once users clearly outgrow immediate generation.

## Recommended Architecture

### 1. New Edge Function

Create a dedicated function:

- `supabase/functions/export-leads/index.ts`

Responsibility:

- authenticate the workspace owner via Firebase JWT bridge
- read query params / body filters
- fetch lead rows directly from Postgres
- return CSV response

Do not reuse `workspace-data` for export.

Reason:

- `workspace-data` is optimized for dashboard/leads UI
- export needs different behavior, different limits, and a different response format

### 2. Request Contract

Support these parameters:

- `scope=all|filtered`
- `search`
- `lead_magnet_id`
- `status` later if needed
- `from`
- `to`

MVP export filters can be minimal:

- `scope`
- `search`

That is enough to match today’s UI.

### 3. CSV Columns

Recommended server export columns:

- `email`
- `name`
- `lead_magnet_title`
- `lead_magnet_slug`
- `source`
- `referrer`
- `delivered_at`
- `created_at`

Later additions if needed:

- `lead_id`
- `lead_magnet_id`
- `workspace_id`
- `unsubscribed_at`

## Query Strategy

Read from:

- `public.leads`
- join `public.lead_magnets`

Use the same ownership/workspace resolution pattern already used in:

- `workspace-data`
- `manage-webhook`
- `publish-magnet`

Important:

- export should query by `workspace_id`
- never trust client-provided workspace identifiers

## Response Strategy

### Small/medium export

Return:

- `Content-Type: text/csv; charset=utf-8`
- `Content-Disposition: attachment; filename="sendlet-leads-YYYY-MM-DD.csv"`

This is enough for the next stage.

### Large export later

Move to:

- async export job
- store generated CSV in Supabase Storage
- return signed download URL

Only do this once synchronous CSV is no longer enough.

## Why Not Build Async Jobs Now

Because it adds complexity too early:

- export job table
- retry model
- job state UI
- storage cleanup
- signed URL lifecycle

For Sendlet right now, that is premature.

## Security Model

The export function should:

1. verify Firebase bearer token
2. resolve authenticated identity to workspace via the existing bridge
3. query only rows where `workspace_id` matches
4. return CSV only for that workspace

Do not expose raw export endpoints to unauthenticated requests.

## Performance Notes

Server-side export helps because:

- the browser no longer needs the full dataset in memory
- filtering can happen in SQL
- CSV generation happens closer to the data
- download begins without rendering every row in the table

But the real benefit is operational clarity:

- export stops depending on UI state
- large exports stop competing with table rendering

## Rollout Plan

### Step 1

Keep current `Leads` page behavior.

### Step 2

Add `export-leads` function with:

- authenticated `scope=all`
- CSV response

### Step 3

Change `Export all` button to call the server export endpoint.

Keep `Export filtered` browser-side for now.

### Step 4

If needed, move filtered export server-side too.

## Recommendation

Do not build the full server export system yet.

The correct boring move is:

- keep today’s client-side export
- implement server-side `Export all` next
- leave async jobs, storage-backed exports, and scheduled exports for later

That gives Sendlet the right cost/complexity profile for MVP while still leaving a clean path into larger workspaces.
