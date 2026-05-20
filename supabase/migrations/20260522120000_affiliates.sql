-- Affiliate program: affiliates, clicks, conversions

create table public.affiliates (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  user_id uuid references auth.users (id) on delete set null,
  name text not null,
  email text not null unique,
  commission_rate numeric(5, 4) not null default 0.30
    check (commission_rate > 0 and commission_rate <= 1),
  status text not null default 'pending'
    check (status in ('pending', 'active', 'paused')),
  pix_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index affiliates_code_idx on public.affiliates (upper(code));
create index affiliates_user_id_idx on public.affiliates (user_id);
create index affiliates_status_idx on public.affiliates (status);

create trigger affiliates_set_updated_at
before update on public.affiliates
for each row execute function public.set_updated_at();

alter table public.affiliates enable row level security;

create policy "deny all affiliates for anon"
  on public.affiliates for all to anon using (false) with check (false);

create policy "deny all affiliates for authenticated"
  on public.affiliates for all to authenticated using (false) with check (false);

-- ---------------------------------------------------------------------------
create table public.affiliate_clicks (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates (id) on delete cascade,
  clicked_at timestamptz not null default now(),
  path text,
  utm_source text
);

create index affiliate_clicks_affiliate_clicked_idx
  on public.affiliate_clicks (affiliate_id, clicked_at desc);

alter table public.affiliate_clicks enable row level security;

create policy "deny all affiliate_clicks for anon"
  on public.affiliate_clicks for all to anon using (false) with check (false);

create policy "deny all affiliate_clicks for authenticated"
  on public.affiliate_clicks for all to authenticated using (false) with check (false);

-- ---------------------------------------------------------------------------
create table public.affiliate_conversions (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates (id) on delete cascade,
  payment_id text not null unique references public.payments (id) on delete cascade,
  amount_cents integer not null,
  commission_cents integer not null,
  product_key text not null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'paid', 'reversed')),
  created_at timestamptz not null default now(),
  approved_at timestamptz
);

create index affiliate_conversions_affiliate_idx on public.affiliate_conversions (affiliate_id);
create index affiliate_conversions_status_idx on public.affiliate_conversions (status);

alter table public.affiliate_conversions enable row level security;

create policy "deny all affiliate_conversions for anon"
  on public.affiliate_conversions for all to anon using (false) with check (false);

create policy "deny all affiliate_conversions for authenticated"
  on public.affiliate_conversions for all to authenticated using (false) with check (false);

-- ---------------------------------------------------------------------------
alter table public.payments
  add column if not exists affiliate_code text;

create index if not exists payments_affiliate_code_idx on public.payments (affiliate_code);
