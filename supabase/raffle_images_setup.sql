alter table public.raffles
add column if not exists image_url text;

insert into storage.buckets (id, name, public)
values ('raffle-images', 'raffle-images', true)
on conflict (id) do nothing;

create policy if not exists "Public can view raffle images"
on storage.objects for select
using (bucket_id = 'raffle-images');

create policy if not exists "Public can upload raffle images"
on storage.objects for insert
with check (bucket_id = 'raffle-images');
