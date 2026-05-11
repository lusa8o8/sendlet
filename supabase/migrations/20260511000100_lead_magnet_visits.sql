create table if not exists public.lead_magnet_visits (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  lead_magnet_id uuid not null references public.lead_magnets(id) on delete cascade,
  source text,
  referrer text,
  user_agent text,
  ip_hash text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists lead_magnet_visits_workspace_created_idx
on public.lead_magnet_visits (workspace_id, created_at desc);

create index if not exists lead_magnet_visits_magnet_created_idx
on public.lead_magnet_visits (lead_magnet_id, created_at desc);

alter table public.lead_magnet_visits enable row level security;

create policy "members can read lead magnet visits"
on public.lead_magnet_visits for select
using (public.is_workspace_member(workspace_id));
