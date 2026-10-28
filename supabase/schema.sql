-- Run this once in the Supabase SQL editor (Dashboard -> SQL Editor).

create type appointment_status as enum ('booked', 'done', 'no_show');

create table appointments (
  id          uuid primary key default gen_random_uuid(),
  client_name text not null check (length(trim(client_name)) > 0),
  -- Normalised to 10 digits; nullable because walk-ins may not leave a number.
  phone       text check (phone ~ '^[0-9]{10}$'),
  date        date not null,
  time        time not null,
  status      appointment_status not null default 'booked',
  confirmed   boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Double-booking guard: only one *booked* appointment per slot (done / no-show rows free it).
create unique index appointments_one_booking_per_slot
  on appointments (date, time) where status = 'booked';

create index appointments_date_time_idx on appointments (date, time);
create index appointments_phone_idx on appointments (phone);

-- The app talks to Supabase from the server with the service-role key, so lock out the public API.
alter table appointments enable row level security;
grant usage on schema public to service_role;
grant all on appointments to service_role;

-- Sample data, cleaned: dates -> ISO (day-first), times -> 24h, phones -> 10 digits.
-- "98200 11111" and "9820011111" are the same person, so Riya's two bookings share one number.
-- Meera Iyer has no phone on file, so it stays null.
insert into appointments (client_name, phone, date, time, status) values
  ('Riya Shah',   '9820011111', '2026-10-24', '10:00', 'booked'),
  ('Arjun Mehta', '9820022222', '2026-10-24', '11:30', 'booked'),
  ('Riya Shah',   '9820011111', '2026-10-25', '16:00', 'booked'),
  ('Meera Iyer',  null,         '2026-10-23', '09:00', 'done'),
  ('Kabir Rao',   '9820033333', '2026-10-22', '14:00', 'no_show');
