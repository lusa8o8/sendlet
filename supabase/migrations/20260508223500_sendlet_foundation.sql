create extension if not exists pgcrypto;

create type public.workspace_role as enum ('owner', 'admin', 'member');
create type public.lead_magnet_status as enum ('draft', 'published', 'paused');
create type public.resource_type as enum ('file', 'external_url', 'none');
create type public.delivery_status as enum ('queued', 'sent', 'failed', 'skipped');
create type public.agent_event_kind as enum (
  'workspace.created',
  'lead_magnet.created',
  'lead_magnet.updated',
  'lead_magnet.published',
  'lead.captured',
  'delivery.queued',
  'delivery.sent',
  'delivery.failed'
);

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.workspace_role not null default 'owner',
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table public.lead_magnets (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  slug text not null,
  description text not null default '',
  status public.lead_magnet_status not null default 'draft',
  resource_type public.resource_type not null default 'none',
  resource_url text,
  resource_file_path text,
  file_name text,
  file_size bigint,
  cta_label text not null default 'Get the resource',
  accent_color text not null default '#0F766E',
  background_preset text not null default 'dusk',
  layout text not null default 'simple',
  page_config jsonb not null default '{}'::jsonb,
  delivery_email_enabled boolean not null default true,
  delivery_email_subject text,
  delivery_email_body text,
  visits_count integer not null default 0,
  leads_count integer not null default 0,
  last_lead_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, slug)
);

create index lead_magnets_slug_idx on public.lead_magnets (slug);
create index lead_magnets_workspace_status_idx on public.lead_magnets (workspace_id, status);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  lead_magnet_id uuid not null references public.lead_magnets(id) on delete cascade,
  email text not null,
  source text,
  referrer text,
  user_agent text,
  ip_hash text,
  metadata jsonb not null default '{}'::jsonb,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  unique (lead_magnet_id, email)
);

create index leads_workspace_created_idx on public.leads (workspace_id, created_at desc);
create index leads_magnet_created_idx on public.leads (lead_magnet_id, created_at desc);

create table public.delivery_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  lead_magnet_id uuid not null references public.lead_magnets(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  status public.delivery_status not null default 'queued',
  provider text not null default 'resend',
  to_email text not null,
  subject text,
  error_message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create index delivery_events_workspace_created_idx on public.delivery_events (workspace_id, created_at desc);

create table public.agent_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  kind public.agent_event_kind not null,
  subject_type text not null,
  subject_id uuid,
  summary text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index agent_events_workspace_created_idx on public.agent_events (workspace_id, created_at desc);
create index agent_events_subject_idx on public.agent_events (subject_type, subject_id);

create table public.agent_state_snapshots (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  subject_type text not null,
  subject_id uuid not null,
  state_key text not null,
  state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, subject_type, subject_id, state_key)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger workspaces_set_updated_at
before update on public.workspaces
for each row execute function public.set_updated_at();

create trigger lead_magnets_set_updated_at
before update on public.lead_magnets
for each row execute function public.set_updated_at();

create trigger agent_state_snapshots_set_updated_at
before update on public.agent_state_snapshots
for each row execute function public.set_updated_at();

create or replace function public.is_workspace_member(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = target_workspace_id
      and wm.user_id = auth.uid()
  );
$$;

create or replace function public.ensure_default_workspace(workspace_name text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  existing_workspace_id uuid;
  next_workspace_id uuid;
  next_name text;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  select wm.workspace_id
  into existing_workspace_id
  from public.workspace_members wm
  where wm.user_id = current_user_id
  order by wm.created_at asc
  limit 1;

  if existing_workspace_id is not null then
    return existing_workspace_id;
  end if;

  next_name := coalesce(nullif(trim(workspace_name), ''), 'Sendlet workspace');

  insert into public.workspaces (name, owner_id)
  values (next_name, current_user_id)
  returning id into next_workspace_id;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (next_workspace_id, current_user_id, 'owner');

  insert into public.agent_events (workspace_id, actor_user_id, kind, subject_type, subject_id, summary)
  values (
    next_workspace_id,
    current_user_id,
    'workspace.created',
    'workspace',
    next_workspace_id,
    'Workspace created'
  );

  return next_workspace_id;
end;
$$;

alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.lead_magnets enable row level security;
alter table public.leads enable row level security;
alter table public.delivery_events enable row level security;
alter table public.agent_events enable row level security;
alter table public.agent_state_snapshots enable row level security;

create policy "members can read their workspaces"
on public.workspaces for select
using (public.is_workspace_member(id));

create policy "owners can update their workspaces"
on public.workspaces for update
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "members can read workspace members"
on public.workspace_members for select
using (public.is_workspace_member(workspace_id));

create policy "members can read lead magnets"
on public.lead_magnets for select
using (public.is_workspace_member(workspace_id));

create policy "members can insert lead magnets"
on public.lead_magnets for insert
with check (public.is_workspace_member(workspace_id) and owner_id = auth.uid());

create policy "members can update lead magnets"
on public.lead_magnets for update
using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));

create policy "members can read leads"
on public.leads for select
using (public.is_workspace_member(workspace_id));

create policy "members can read delivery events"
on public.delivery_events for select
using (public.is_workspace_member(workspace_id));

create policy "members can read agent events"
on public.agent_events for select
using (public.is_workspace_member(workspace_id));

create policy "members can read agent state"
on public.agent_state_snapshots for select
using (public.is_workspace_member(workspace_id));

create policy "members can upsert agent state"
on public.agent_state_snapshots for insert
with check (public.is_workspace_member(workspace_id));

create policy "members can update agent state"
on public.agent_state_snapshots for update
using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('lead-magnet-assets', 'lead-magnet-assets', false, 52428800, null)
on conflict (id) do nothing;

create policy "members can upload lead magnet assets"
on storage.objects for insert
with check (
  bucket_id = 'lead-magnet-assets'
  and public.is_workspace_member((storage.foldername(name))[1]::uuid)
);

create policy "members can read lead magnet assets"
on storage.objects for select
using (
  bucket_id = 'lead-magnet-assets'
  and public.is_workspace_member((storage.foldername(name))[1]::uuid)
);

create policy "members can update lead magnet assets"
on storage.objects for update
using (
  bucket_id = 'lead-magnet-assets'
  and public.is_workspace_member((storage.foldername(name))[1]::uuid)
)
with check (
  bucket_id = 'lead-magnet-assets'
  and public.is_workspace_member((storage.foldername(name))[1]::uuid)
);
