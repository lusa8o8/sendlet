create table if not exists public.unsubscribes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  lead_magnet_id uuid references public.lead_magnets(id) on delete cascade,
  email text not null,
  scope text not null default 'lead_magnet',
  created_at timestamptz not null default now(),
  unique (lead_magnet_id, email)
);

create index if not exists unsubscribes_workspace_created_idx
on public.unsubscribes (workspace_id, created_at desc);

alter table public.unsubscribes enable row level security;

create policy "members can read unsubscribes"
on public.unsubscribes for select
using (public.is_workspace_member(workspace_id));
