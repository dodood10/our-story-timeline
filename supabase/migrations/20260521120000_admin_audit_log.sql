-- Admin audit log (service role only — no client policies)

create table public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references auth.users (id) on delete cascade,
  action text not null,
  target_user_id uuid references auth.users (id) on delete set null,
  payload jsonb,
  created_at timestamptz not null default now()
);

create index admin_audit_log_created_at_idx on public.admin_audit_log (created_at desc);
create index admin_audit_log_target_user_id_idx on public.admin_audit_log (target_user_id);
create index admin_audit_log_action_idx on public.admin_audit_log (action);

alter table public.admin_audit_log enable row level security;

create policy "deny all admin_audit_log for anon"
  on public.admin_audit_log for all to anon using (false) with check (false);

create policy "deny all admin_audit_log for authenticated"
  on public.admin_audit_log for all to authenticated using (false) with check (false);
