-- PREPARATORY MIGRATION — DO NOT APPLY TO AN EXISTING PROJECT BEFORE SCHEMA AUDIT.
-- New prefixed tables intentionally avoid modifying historical tables.
-- Production client is NOT connected in this MVP.
create table if not exists public.lq_child_profiles (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  display_alias text not null default 'Explorateur' check (length(display_alias) between 1 and 32),
  created_at timestamptz not null default now(),
  unique(id,owner_user_id)
);
create table if not exists public.lq_knowledge_nodes (
  id text primary key, version integer not null check(version>0),
  title text not null, domain text not null, summary text not null,
  editorial_status text not null default 'draft' check(editorial_status in ('draft','review','published')),
  updated_at timestamptz not null default now()
);
create table if not exists public.lq_knowledge_relations (
  source_id text not null references public.lq_knowledge_nodes(id) on delete cascade,
  target_id text not null references public.lq_knowledge_nodes(id) on delete cascade,
  kind text not null check(kind in ('prerequisite','deepen','related','application')),
  primary key(source_id,target_id,kind),check(source_id <> target_id)
);
create table if not exists public.lq_learning_progress (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.lq_child_profiles(id) on delete cascade,
  knowledge_id text not null references public.lq_knowledge_nodes(id),
  content_version integer not null check(content_version>0),
  evidence jsonb not null default '{}'::jsonb,
  last_review_at timestamptz,
  updated_at timestamptz not null default now(),
  unique(child_id,knowledge_id,content_version)
);
create table if not exists public.lq_learning_attempts (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.lq_child_profiles(id) on delete cascade,
  knowledge_id text not null references public.lq_knowledge_nodes(id),
  content_version integer not null check(content_version>0),
  answer_data jsonb not null default '{}'::jsonb,
  submitted_at timestamptz not null default now(),
  server_verified boolean not null default false
);
create table if not exists public.lq_star_transactions (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.lq_child_profiles(id) on delete cascade,
  idempotency_key text not null,
  delta integer not null check(delta between -1000 and 1000 and delta <> 0),
  reason text not null,created_at timestamptz not null default now(),
  unique(child_id,idempotency_key)
);
create table if not exists public.lq_reward_catalog (
  id text primary key,title text not null,price integer not null check(price>=0),
  active boolean not null default false,
  virtual_only boolean not null default true check(virtual_only)
);
create table if not exists public.lq_reward_inventory (
  child_id uuid not null references public.lq_child_profiles(id) on delete cascade,
  reward_id text not null references public.lq_reward_catalog(id),
  acquired_at timestamptz not null default now(),primary key(child_id,reward_id)
);
create table if not exists public.lq_daily_spotlights (
  spotlight_date date primary key,
  knowledge_id text not null references public.lq_knowledge_nodes(id),
  published boolean not null default false
);

-- Enable RLS on ALL exposed tables, including editorial reference tables.
alter table public.lq_child_profiles enable row level security;
alter table public.lq_knowledge_nodes enable row level security;
alter table public.lq_knowledge_relations enable row level security;
alter table public.lq_learning_progress enable row level security;
alter table public.lq_learning_attempts enable row level security;
alter table public.lq_star_transactions enable row level security;
alter table public.lq_reward_catalog enable row level security;
alter table public.lq_reward_inventory enable row level security;
alter table public.lq_daily_spotlights enable row level security;

create policy "lq parent owns child profile" on public.lq_child_profiles
  for select to authenticated using ((select auth.uid()) = owner_user_id);
create policy "lq parent creates own profile" on public.lq_child_profiles
  for insert to authenticated with check ((select auth.uid()) = owner_user_id);
create policy "lq parent edits own profile" on public.lq_child_profiles
  for update to authenticated using ((select auth.uid()) = owner_user_id)
  with check ((select auth.uid()) = owner_user_id);
create policy "lq parent removes own profile" on public.lq_child_profiles
  for delete to authenticated using ((select auth.uid()) = owner_user_id);

create policy "lq published knowledge only" on public.lq_knowledge_nodes
  for select to anon,authenticated using (editorial_status = 'published');
create policy "lq published edges only" on public.lq_knowledge_relations
  for select to anon,authenticated using (
    exists(select 1 from public.lq_knowledge_nodes s where s.id=source_id and s.editorial_status='published') and
    exists(select 1 from public.lq_knowledge_nodes t where t.id=target_id and t.editorial_status='published'));
create policy "lq published spotlights" on public.lq_daily_spotlights
  for select to anon,authenticated using (published = true and exists(
    select 1 from public.lq_knowledge_nodes n where n.id=knowledge_id and n.editorial_status='published'));
create policy "lq active virtual rewards" on public.lq_reward_catalog
  for select to authenticated using(active = true and virtual_only = true);

-- Authenticated parent may only READ their own children's server records.
-- Writes must come through dedicated validated server endpoints with authority checks.
create policy "lq parent reads progress" on public.lq_learning_progress
  for select to authenticated using(exists(
    select 1 from public.lq_child_profiles p
    where p.id=child_id and p.owner_user_id=(select auth.uid())));
create policy "lq parent reads attempts" on public.lq_learning_attempts
  for select to authenticated using(exists(
    select 1 from public.lq_child_profiles p
    where p.id=child_id and p.owner_user_id=(select auth.uid())));
create policy "lq parent reads star ledger" on public.lq_star_transactions
  for select to authenticated using(exists(
    select 1 from public.lq_child_profiles p
    where p.id=child_id and p.owner_user_id=(select auth.uid())));
create policy "lq parent reads inventory" on public.lq_reward_inventory
  for select to authenticated using(exists(
    select 1 from public.lq_child_profiles p
    where p.id=child_id and p.owner_user_id=(select auth.uid())));

-- Restrict Data API privileges independently of row policies.
revoke all on public.lq_child_profiles,public.lq_knowledge_nodes,
 public.lq_knowledge_relations,public.lq_learning_progress,public.lq_learning_attempts,
 public.lq_star_transactions,public.lq_reward_catalog,public.lq_reward_inventory,
 public.lq_daily_spotlights from anon,authenticated;
grant select on public.lq_knowledge_nodes,public.lq_knowledge_relations,
 public.lq_daily_spotlights to anon,authenticated;
grant select,insert,update,delete on public.lq_child_profiles to authenticated;
grant select on public.lq_learning_progress,public.lq_learning_attempts,
 public.lq_star_transactions,public.lq_reward_catalog,public.lq_reward_inventory to authenticated;
