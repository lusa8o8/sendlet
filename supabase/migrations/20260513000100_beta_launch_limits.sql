alter table public.workspaces
  add column if not exists plan text not null default 'beta_free',
  add column if not exists beta_status text not null default 'active',
  add column if not exists lead_magnet_limit integer not null default 3,
  add column if not exists monthly_lead_limit integer not null default 250,
  add column if not exists monthly_email_limit integer not null default 250,
  add column if not exists file_size_limit bigint not null default 10485760;

alter table public.workspaces
  add constraint workspaces_beta_status_check
  check (beta_status in ('active', 'waitlist', 'blocked'));

alter table public.workspaces
  add constraint workspaces_limit_values_check
  check (
    lead_magnet_limit >= 0
    and monthly_lead_limit >= 0
    and monthly_email_limit >= 0
    and file_size_limit >= 0
  );

create index if not exists workspaces_plan_idx
on public.workspaces (plan);

