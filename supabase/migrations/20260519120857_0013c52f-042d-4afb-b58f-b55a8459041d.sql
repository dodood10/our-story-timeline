create table public.payments (
  id text primary key,
  external_reference text not null,
  status text not null,
  amount_cents integer not null,
  product_key text not null,
  payer_email text,
  payment_method text not null,
  raw jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index payments_external_reference_idx on public.payments (external_reference);
create index payments_status_idx on public.payments (status);

create trigger payments_set_updated_at
before update on public.payments
for each row execute function public.set_updated_at();

-- RLS já é habilitada pelo event trigger rls_auto_enable.
-- Bloqueia acesso direto: somente service role (server) lê/grava.
create policy "deny select for anon" on public.payments
  for select to anon, authenticated using (false);
create policy "deny insert for anon" on public.payments
  for insert to anon, authenticated with check (false);
create policy "deny update for anon" on public.payments
  for update to anon, authenticated using (false);
create policy "deny delete for anon" on public.payments
  for delete to anon, authenticated using (false);