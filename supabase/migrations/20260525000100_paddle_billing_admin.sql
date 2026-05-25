alter table public.workspaces
  add column if not exists billing_status text not null default 'free',
  add column if not exists paddle_customer_id text,
  add column if not exists paddle_subscription_id text,
  add column if not exists paddle_price_id text,
  add column if not exists paddle_transaction_id text,
  add column if not exists current_period_starts_at timestamptz,
  add column if not exists current_period_ends_at timestamptz,
  add column if not exists trial_ends_at timestamptz,
  add column if not exists canceled_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'workspaces_billing_status_check'
  ) then
    alter table public.workspaces
      add constraint workspaces_billing_status_check
      check (billing_status in ('free', 'trialing', 'active', 'past_due', 'paused', 'canceled'));
  end if;
end $$;

create index if not exists workspaces_billing_status_idx
  on public.workspaces (billing_status);

create index if not exists workspaces_paddle_customer_idx
  on public.workspaces (paddle_customer_id)
  where paddle_customer_id is not null;

create index if not exists workspaces_paddle_subscription_idx
  on public.workspaces (paddle_subscription_id)
  where paddle_subscription_id is not null;

create table if not exists public.billing_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete set null,
  paddle_event_id text unique,
  event_type text not null,
  paddle_customer_id text,
  paddle_subscription_id text,
  paddle_transaction_id text,
  paddle_price_id text,
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz,
  error_message text,
  created_at timestamptz not null default now()
);

alter table public.billing_events enable row level security;

create index if not exists billing_events_workspace_idx
  on public.billing_events (workspace_id, created_at desc);

create index if not exists billing_events_paddle_event_idx
  on public.billing_events (paddle_event_id)
  where paddle_event_id is not null;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'billing_events'
      and policyname = 'Workspace members can read billing events'
  ) then
    create policy "Workspace members can read billing events"
      on public.billing_events
      for select
      using (workspace_id is not null and public.is_workspace_member(workspace_id));
  end if;
end $$;
