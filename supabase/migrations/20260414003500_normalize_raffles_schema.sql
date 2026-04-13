create table if not exists raffles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  total_tickets integer not null default 0,
  price_per_ticket numeric not null default 0,
  tickets_sold integer not null default 0,
  status text not null default 'active',
  created_at timestamptz default now(),
  drawn_at timestamptz,
  winning_ticket_number integer,
  ends_at timestamptz
);

alter table raffles
add column if not exists title text;

alter table raffles
add column if not exists description text;

alter table raffles
add column if not exists total_tickets integer not null default 0;

alter table raffles
add column if not exists price_per_ticket numeric not null default 0;

alter table raffles
add column if not exists tickets_sold integer not null default 0;

alter table raffles
add column if not exists status text not null default 'active';

alter table raffles
add column if not exists created_at timestamptz default now();

alter table raffles
add column if not exists drawn_at timestamptz;

alter table raffles
add column if not exists winning_ticket_number integer;

alter table raffles
add column if not exists ends_at timestamptz;

alter table raffles
add column if not exists skill_question_id uuid references skill_questions(id) on delete set null;

alter table raffles
add column if not exists image_url text;

alter table raffles disable row level security;
