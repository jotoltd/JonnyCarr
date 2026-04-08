create table if not exists skill_questions (
  id uuid primary key default gen_random_uuid(),
  prompt text not null,
  answer text not null,
  is_active boolean not null default true,
  created_at timestamptz default now()
);

alter table skill_questions disable row level security;

alter table raffles
add column if not exists skill_question_id uuid references skill_questions(id) on delete set null;

alter table raffles
add column if not exists image_url text;

insert into storage.buckets (id, name, public)
values ('raffle-images', 'raffle-images', true)
on conflict (id) do nothing;

drop policy if exists "Public can view raffle images" on storage.objects;
create policy "Public can view raffle images"
on storage.objects for select
using (bucket_id = 'raffle-images');

drop policy if exists "Public can upload raffle images" on storage.objects;
create policy "Public can upload raffle images"
on storage.objects for insert
with check (bucket_id = 'raffle-images');
