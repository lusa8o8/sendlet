create or replace function public.increment_lead_magnet_leads(magnet_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.lead_magnets
  set
    leads_count = leads_count + 1,
    last_lead_at = now()
  where id = magnet_id;
$$;

create or replace function public.increment_lead_magnet_visits(magnet_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.lead_magnets
  set visits_count = visits_count + 1
  where id = magnet_id;
$$;
