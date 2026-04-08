create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password text not null,
  name text not null,
  created_at timestamptz default now()
);

create table if not exists paypal_settings (
  id uuid primary key default gen_random_uuid(),
  client_id text not null default '',
  business_email text not null default '',
  mode text not null default 'sandbox',
  enabled boolean not null default false,
  updated_at timestamptz default now()
);

insert into users (email, password, name)
values ('jonathan@jonnycarr.co.uk', 'R1l3yj014!', 'Jonathan')
on conflict (email) do nothing;

alter table users disable row level security;
alter table paypal_settings disable row level security;
