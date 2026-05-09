alter table public.workspaces
  alter column owner_id drop not null,
  add column if not exists owner_external_id text,
  add column if not exists owner_email text;

alter table public.lead_magnets
  alter column owner_id drop not null,
  add column if not exists owner_external_id text,
  add column if not exists owner_email text;

create index if not exists workspaces_owner_external_idx
on public.workspaces (owner_external_id)
where owner_external_id is not null;

create index if not exists lead_magnets_owner_external_idx
on public.lead_magnets (owner_external_id)
where owner_external_id is not null;
