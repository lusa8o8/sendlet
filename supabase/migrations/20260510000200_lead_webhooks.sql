create table if not exists public.lead_webhooks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  url text not null,
  enabled boolean not null default true,
  last_status integer,
  last_error text,
  last_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id)
);

create trigger lead_webhooks_set_updated_at
before update on public.lead_webhooks
for each row execute function public.set_updated_at();

alter table public.lead_webhooks enable row level security;

create policy "members can read lead webhooks"
on public.lead_webhooks for select
using (public.is_workspace_member(workspace_id));

create policy "members can manage lead webhooks"
on public.lead_webhooks for all
using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));
