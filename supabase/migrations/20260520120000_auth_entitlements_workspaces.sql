-- Auth profiles, server entitlements, workspace sync, payments.user_id

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- user_entitlements
-- ---------------------------------------------------------------------------
create table public.user_entitlements (
  user_id uuid primary key references auth.users (id) on delete cascade,
  surprise_tier text not null default 'none'
    check (surprise_tier in ('none', 'basic', 'premium')),
  subscription jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_entitlements enable row level security;

create policy "entitlements_select_own"
  on public.user_entitlements for select
  to authenticated
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- couple workspaces
-- ---------------------------------------------------------------------------
create table public.couple_workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  invite_code text not null unique,
  created_at timestamptz not null default now()
);

create index couple_workspaces_owner_id_idx on public.couple_workspaces (owner_id);

alter table public.couple_workspaces enable row level security;

create table public.workspace_members (
  workspace_id uuid not null references public.couple_workspaces (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('owner', 'partner')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create index workspace_members_user_id_idx on public.workspace_members (user_id);

alter table public.workspace_members enable row level security;

create table public.workspace_snapshots (
  workspace_id uuid primary key references public.couple_workspaces (id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.workspace_snapshots enable row level security;

-- Helper: is member of workspace
create or replace function public.is_workspace_member(p_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = p_workspace_id
      and wm.user_id = auth.uid()
  );
$$;

revoke all on function public.is_workspace_member(uuid) from public;
grant execute on function public.is_workspace_member(uuid) to authenticated;

-- couple_workspaces policies
create policy "workspaces_select_member"
  on public.couple_workspaces for select
  to authenticated
  using (public.is_workspace_member(id));

create policy "workspaces_insert_owner"
  on public.couple_workspaces for insert
  to authenticated
  with check (owner_id = auth.uid());

-- workspace_members policies
create policy "members_select_same_workspace"
  on public.workspace_members for select
  to authenticated
  using (public.is_workspace_member(workspace_id));

create policy "members_insert_self_partner"
  on public.workspace_members for insert
  to authenticated
  with check (user_id = auth.uid() and role = 'partner');

-- workspace_snapshots policies
create policy "snapshots_select_member"
  on public.workspace_snapshots for select
  to authenticated
  using (public.is_workspace_member(workspace_id));

create policy "snapshots_insert_member"
  on public.workspace_snapshots for insert
  to authenticated
  with check (public.is_workspace_member(workspace_id));

create policy "snapshots_update_member"
  on public.workspace_snapshots for update
  to authenticated
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

-- ---------------------------------------------------------------------------
-- RPCs: workspace lifecycle
-- ---------------------------------------------------------------------------
create or replace function public.ensure_my_workspace()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_workspace_id uuid;
  v_code text;
  v_alphabet text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  i int;
begin
  if auth.uid() is null then
    raise exception 'Não autenticado';
  end if;

  select wm.workspace_id into v_workspace_id
  from public.workspace_members wm
  where wm.user_id = auth.uid()
  limit 1;

  if v_workspace_id is not null then
    return v_workspace_id;
  end if;

  v_code := '';
  for i in 1..12 loop
    v_code := v_code || substr(v_alphabet, 1 + floor(random() * length(v_alphabet))::int, 1);
  end loop;

  insert into public.couple_workspaces (owner_id, invite_code)
  values (auth.uid(), v_code)
  returning id into v_workspace_id;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (v_workspace_id, auth.uid(), 'owner');

  return v_workspace_id;
end;
$$;

create or replace function public.join_workspace_by_code(p_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_workspace_id uuid;
  v_normalized text;
begin
  if auth.uid() is null then
    raise exception 'Não autenticado';
  end if;

  v_normalized := upper(trim(p_code));
  if v_normalized is null or length(v_normalized) < 8 then
    raise exception 'Código inválido';
  end if;

  select id into v_workspace_id
  from public.couple_workspaces
  where invite_code = v_normalized;

  if v_workspace_id is null then
    raise exception 'Código não encontrado';
  end if;

  if exists (
    select 1 from public.workspace_members
    where workspace_id = v_workspace_id and user_id = auth.uid()
  ) then
    return v_workspace_id;
  end if;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (v_workspace_id, auth.uid(), 'partner');

  return v_workspace_id;
end;
$$;

create or replace function public.get_my_workspace_invite_code()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text;
begin
  if auth.uid() is null then
    raise exception 'Não autenticado';
  end if;

  select cw.invite_code into v_code
  from public.couple_workspaces cw
  join public.workspace_members wm on wm.workspace_id = cw.id
  where wm.user_id = auth.uid() and wm.role = 'owner'
  limit 1;

  return v_code;
end;
$$;

revoke all on function public.ensure_my_workspace() from public;
revoke all on function public.join_workspace_by_code(text) from public;
revoke all on function public.get_my_workspace_invite_code() from public;
grant execute on function public.ensure_my_workspace() to authenticated;
grant execute on function public.join_workspace_by_code(text) to authenticated;
grant execute on function public.get_my_workspace_invite_code() to authenticated;

-- ---------------------------------------------------------------------------
-- payments.user_id
-- ---------------------------------------------------------------------------
alter table public.payments
  add column if not exists user_id uuid references auth.users (id) on delete set null;

create index if not exists payments_user_id_idx on public.payments (user_id);
create index if not exists payments_payer_email_idx on public.payments (payer_email);

-- ---------------------------------------------------------------------------
-- Deprecate legacy couple_sync RPCs (keep table for one release)
-- ---------------------------------------------------------------------------
revoke execute on function public.get_couple_sync(text) from anon, authenticated;
revoke execute on function public.upsert_couple_sync(text, jsonb) from anon, authenticated;
