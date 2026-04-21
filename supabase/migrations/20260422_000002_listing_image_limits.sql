alter table public.listings
drop constraint if exists listings_image_paths_count_check;

alter table public.listings
add constraint listings_image_paths_count_check
check (cardinality(image_paths) between 1 and 5);
