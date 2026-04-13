alter table users
add column if not exists role text not null default 'user';

update users
set role = 'admin'
where email = 'josh@gmail.com';
