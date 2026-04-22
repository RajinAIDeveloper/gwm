alter table public.inquiries
add column if not exists last_message_at timestamptz not null default timezone('utc', now()),
add column if not exists seller_last_read_at timestamptz,
add column if not exists buyer_last_read_at timestamptz;

update public.inquiries
set
  last_message_at = coalesce(last_message_at, created_at),
  buyer_last_read_at = coalesce(buyer_last_read_at, created_at);

create table if not exists public.inquiry_messages (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references public.inquiries (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  sender_role public.app_role not null check (sender_role in ('seller', 'buyer')),
  message text not null check (char_length(trim(message)) between 1 and 1200),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists inquiry_messages_inquiry_id_idx on public.inquiry_messages (inquiry_id);
create index if not exists inquiry_messages_created_at_idx on public.inquiry_messages (created_at desc);
create index if not exists inquiries_last_message_at_idx on public.inquiries (last_message_at desc);

insert into public.inquiry_messages (inquiry_id, sender_id, sender_role, message, created_at)
select
  inquiries.id,
  inquiries.buyer_id,
  'buyer'::public.app_role,
  inquiries.message,
  inquiries.created_at
from public.inquiries
where not exists (
  select 1
  from public.inquiry_messages
  where inquiry_messages.inquiry_id = inquiries.id
);

alter table public.inquiry_messages enable row level security;

drop policy if exists "inquiries_participant_update" on public.inquiries;
create policy "inquiries_participant_update"
on public.inquiries
for update
using (
  auth.uid() = buyer_id
  or exists (
    select 1
    from public.listings
    where listings.id = listing_id
      and listings.seller_id = auth.uid()
  )
)
with check (
  auth.uid() = buyer_id
  or exists (
    select 1
    from public.listings
    where listings.id = listing_id
      and listings.seller_id = auth.uid()
  )
);

drop policy if exists "inquiry_messages_visible_to_participants" on public.inquiry_messages;
create policy "inquiry_messages_visible_to_participants"
on public.inquiry_messages
for select
using (
  exists (
    select 1
    from public.inquiries
    join public.listings on listings.id = inquiries.listing_id
    where inquiries.id = inquiry_id
      and (
        inquiries.buyer_id = auth.uid()
        or listings.seller_id = auth.uid()
      )
  )
);

drop policy if exists "inquiry_messages_buyer_insert" on public.inquiry_messages;
create policy "inquiry_messages_buyer_insert"
on public.inquiry_messages
for insert
with check (
  auth.uid() = sender_id
  and sender_role = 'buyer'::public.app_role
  and exists (
    select 1
    from public.inquiries
    where inquiries.id = inquiry_id
      and inquiries.buyer_id = auth.uid()
  )
);

drop policy if exists "inquiry_messages_seller_insert" on public.inquiry_messages;
create policy "inquiry_messages_seller_insert"
on public.inquiry_messages
for insert
with check (
  auth.uid() = sender_id
  and sender_role = 'seller'::public.app_role
  and exists (
    select 1
    from public.inquiries
    join public.listings on listings.id = inquiries.listing_id
    where inquiries.id = inquiry_id
      and listings.seller_id = auth.uid()
  )
);
