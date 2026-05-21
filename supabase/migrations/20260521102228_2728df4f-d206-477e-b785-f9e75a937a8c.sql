
-- profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  city text,
  bio text,
  avatar_url text,
  is_repairer boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "profiles viewable by authenticated"
  on public.profiles for select to authenticated using (true);
create policy "users insert own profile"
  on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "users update own profile"
  on public.profiles for update to authenticated using (auth.uid() = id);

-- auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- repair_requests
create type public.request_status as enum ('open', 'in_progress', 'completed', 'cancelled');

create table public.repair_requests (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  device_brand text not null,
  device_model text not null,
  problem_description text not null,
  photo_url text,
  budget_max numeric(10,2),
  city text not null,
  status public.request_status not null default 'open',
  accepted_bid_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.repair_requests enable row level security;

create policy "requests viewable by authenticated"
  on public.repair_requests for select to authenticated using (true);
create policy "owner inserts request"
  on public.repair_requests for insert to authenticated with check (auth.uid() = owner_id);
create policy "owner updates own request"
  on public.repair_requests for update to authenticated using (auth.uid() = owner_id);
create policy "owner deletes own request"
  on public.repair_requests for delete to authenticated using (auth.uid() = owner_id);

create trigger requests_updated_at before update on public.repair_requests
  for each row execute function public.set_updated_at();

create index repair_requests_status_idx on public.repair_requests(status, created_at desc);
create index repair_requests_owner_idx on public.repair_requests(owner_id);

-- bids
create type public.bid_status as enum ('pending', 'accepted', 'rejected', 'withdrawn');

create table public.bids (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.repair_requests(id) on delete cascade,
  repairer_id uuid not null references auth.users(id) on delete cascade,
  price numeric(10,2) not null check (price >= 0),
  message text,
  repair_days int not null default 3 check (repair_days > 0),
  status public.bid_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (request_id, repairer_id)
);
alter table public.bids enable row level security;

create policy "bids viewable by authenticated"
  on public.bids for select to authenticated using (true);
create policy "repairer inserts own bid"
  on public.bids for insert to authenticated with check (auth.uid() = repairer_id);
create policy "repairer updates own bid"
  on public.bids for update to authenticated using (auth.uid() = repairer_id);
create policy "request owner updates bid status"
  on public.bids for update to authenticated
  using (exists (select 1 from public.repair_requests r where r.id = bids.request_id and r.owner_id = auth.uid()));

create trigger bids_updated_at before update on public.bids
  for each row execute function public.set_updated_at();

create index bids_request_idx on public.bids(request_id, price asc);
