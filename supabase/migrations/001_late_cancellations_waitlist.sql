-- For databases created from the first version of schema.sql.
-- Fresh installs don't need this: schema.sql already includes everything below.
-- Run once in the Supabase SQL editor.

alter table appointments add column if not exists running_late boolean not null default false;

create table if not exists cancellations (
  id           uuid primary key default gen_random_uuid(),
  client_name  text not null,
  phone        text,
  date         date not null,
  time         time not null,
  reason       text,
  cancelled_at timestamptz not null default now()
);

create table if not exists waitlist (
  id          uuid primary key default gen_random_uuid(),
  client_name text not null check (length(trim(client_name)) > 0),
  phone       text not null check (phone ~ '^[0-9]{10}$'),
  date        date not null,
  created_at  timestamptz not null default now(),
  unique (phone, date)
);

alter table cancellations enable row level security;
alter table waitlist enable row level security;
grant all on cancellations, waitlist to service_role;
