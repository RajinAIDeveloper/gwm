create extension if not exists pgcrypto;

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'app_role'
  ) then
    create type public.app_role as enum ('seller', 'buyer', 'admin');
  end if;
end
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.app_role not null,
  display_name text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(trim(title)) between 3 and 120),
  description text not null check (char_length(trim(description)) between 20 and 2000),
  category text not null,
  quantity_kg numeric(12, 2) not null check (quantity_kg > 0),
  price_per_kg numeric(12, 2) not null check (price_per_kg >= 0),
  image_paths text[] not null default '{}',
  status text not null default 'active' check (status in ('active')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  buyer_name text,
  buyer_email text not null,
  message text not null check (char_length(trim(message)) between 10 and 1200),
  created_at timestamptz not null default timezone('utc', now()),
  constraint inquiries_listing_buyer_unique unique (listing_id, buyer_id)
);

create index if not exists listings_seller_id_idx on public.listings (seller_id);
create index if not exists listings_category_idx on public.listings (category);
create index if not exists listings_created_at_idx on public.listings (created_at desc);
create index if not exists inquiries_listing_id_idx on public.inquiries (listing_id);
create index if not exists inquiries_buyer_id_idx on public.inquiries (buyer_id);
create index if not exists inquiries_created_at_idx on public.inquiries (created_at desc);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists listings_set_updated_at on public.listings;
create trigger listings_set_updated_at
before update on public.listings
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role public.app_role;
begin
  requested_role :=
    case coalesce(new.raw_user_meta_data ->> 'role', 'buyer')
      when 'seller' then 'seller'::public.app_role
      when 'admin' then 'admin'::public.app_role
      else 'buyer'::public.app_role
    end;

  insert into public.profiles (id, role, display_name)
  values (
    new.id,
    requested_role,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'display_name', '')), '')
  )
  on conflict (id) do update
  set
    role = excluded.role,
    display_name = coalesce(excluded.display_name, public.profiles.display_name),
    updated_at = timezone('utc', now());

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user_profile();

alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.inquiries enable row level security;

do $$
begin
  if not exists (
    select 1 from storage.buckets where id = 'listing-images'
  ) then
    insert into storage.buckets (id, name, public)
    values ('listing-images', 'listing-images', true);
  end if;
end
$$;

create policy "profiles_select_public_sellers_or_self"
on public.profiles
for select
using (role = 'seller'::public.app_role or auth.uid() = id);

create policy "profiles_insert_self"
on public.profiles
for insert
with check (auth.uid() = id);

create policy "profiles_update_self"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "listings_public_read"
on public.listings
for select
using (status = 'active');

create policy "listings_seller_insert"
on public.listings
for insert
with check (
  auth.uid() = seller_id
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'seller'::public.app_role
  )
);

create policy "listings_seller_update"
on public.listings
for update
using (
  auth.uid() = seller_id
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'seller'::public.app_role
  )
)
with check (
  auth.uid() = seller_id
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'seller'::public.app_role
  )
);

create policy "listings_seller_delete"
on public.listings
for delete
using (
  auth.uid() = seller_id
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'seller'::public.app_role
  )
);

create policy "inquiries_buyer_insert"
on public.inquiries
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
    from public.listings
    where listings.id = listing_id
      and listings.seller_id <> auth.uid()
  )
);

create policy "inquiries_visible_to_listing_seller_or_buyer"
on public.inquiries
for select
using (
  auth.uid() = buyer_id
  or exists (
    select 1
    from public.listings
    where listings.id = listing_id
      and listings.seller_id = auth.uid()
  )
);

create policy "storage_public_read_listing_images"
on storage.objects
for select
using (bucket_id = 'listing-images');

create policy "storage_seller_insert_listing_images"
on storage.objects
for insert
with check (
  bucket_id = 'listing-images'
  and auth.uid()::text = (storage.foldername(name))[1]
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'seller'::public.app_role
  )
);

create policy "storage_seller_update_listing_images"
on storage.objects
for update
using (
  bucket_id = 'listing-images'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'listing-images'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "storage_seller_delete_listing_images"
on storage.objects
for delete
using (
  bucket_id = 'listing-images'
  and auth.uid()::text = (storage.foldername(name))[1]
);
