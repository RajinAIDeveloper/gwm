create table if not exists public.supplier_ratings (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  seller_id uuid not null references public.profiles (id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint supplier_ratings_buyer_seller_unique unique (buyer_id, seller_id)
);

create table if not exists public.listing_wishlists (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  constraint listing_wishlists_buyer_listing_unique unique (buyer_id, listing_id)
);

create table if not exists public.seller_follows (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  seller_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  constraint seller_follows_buyer_seller_unique unique (buyer_id, seller_id)
);

create index if not exists supplier_ratings_seller_id_idx on public.supplier_ratings (seller_id);
create index if not exists supplier_ratings_buyer_id_idx on public.supplier_ratings (buyer_id);
create index if not exists listing_wishlists_buyer_id_idx on public.listing_wishlists (buyer_id);
create index if not exists listing_wishlists_listing_id_idx on public.listing_wishlists (listing_id);
create index if not exists seller_follows_buyer_id_idx on public.seller_follows (buyer_id);
create index if not exists seller_follows_seller_id_idx on public.seller_follows (seller_id);

drop trigger if exists supplier_ratings_set_updated_at on public.supplier_ratings;
create trigger supplier_ratings_set_updated_at
before update on public.supplier_ratings
for each row
execute function public.set_updated_at();

alter table public.supplier_ratings enable row level security;
alter table public.listing_wishlists enable row level security;
alter table public.seller_follows enable row level security;

drop policy if exists "supplier_ratings_public_read" on public.supplier_ratings;
create policy "supplier_ratings_public_read"
on public.supplier_ratings
for select
using (true);

drop policy if exists "supplier_ratings_buyer_insert" on public.supplier_ratings;
create policy "supplier_ratings_buyer_insert"
on public.supplier_ratings
for insert
with check (
  auth.uid() = buyer_id
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'buyer'::public.app_role
  )
  and exists (
    select 1
    from public.profiles
    where profiles.id = seller_id
      and profiles.role = 'seller'::public.app_role
  )
);

drop policy if exists "supplier_ratings_buyer_update" on public.supplier_ratings;
create policy "supplier_ratings_buyer_update"
on public.supplier_ratings
for update
using (auth.uid() = buyer_id)
with check (
  auth.uid() = buyer_id
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'buyer'::public.app_role
  )
);

drop policy if exists "supplier_ratings_buyer_delete" on public.supplier_ratings;
create policy "supplier_ratings_buyer_delete"
on public.supplier_ratings
for delete
using (auth.uid() = buyer_id);

drop policy if exists "listing_wishlists_buyer_select" on public.listing_wishlists;
create policy "listing_wishlists_buyer_select"
on public.listing_wishlists
for select
using (auth.uid() = buyer_id);

drop policy if exists "listing_wishlists_buyer_insert" on public.listing_wishlists;
create policy "listing_wishlists_buyer_insert"
on public.listing_wishlists
for insert
with check (
  auth.uid() = buyer_id
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'buyer'::public.app_role
  )
);

drop policy if exists "listing_wishlists_buyer_delete" on public.listing_wishlists;
create policy "listing_wishlists_buyer_delete"
on public.listing_wishlists
for delete
using (auth.uid() = buyer_id);

drop policy if exists "seller_follows_buyer_select" on public.seller_follows;
create policy "seller_follows_buyer_select"
on public.seller_follows
for select
using (auth.uid() = buyer_id);

drop policy if exists "seller_follows_buyer_insert" on public.seller_follows;
create policy "seller_follows_buyer_insert"
on public.seller_follows
for insert
with check (
  auth.uid() = buyer_id
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'buyer'::public.app_role
  )
  and exists (
    select 1
    from public.profiles
    where profiles.id = seller_id
      and profiles.role = 'seller'::public.app_role
  )
);

drop policy if exists "seller_follows_buyer_delete" on public.seller_follows;
create policy "seller_follows_buyer_delete"
on public.seller_follows
for delete
using (auth.uid() = buyer_id);
