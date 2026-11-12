-- Velvet Palms: opening night reservations
-- Safe to run more than once.

create extension if not exists pgcrypto;

create table if not exists sittings (
  id          serial primary key,
  label       text not null,
  starts_at   timestamptz not null,
  capacity    int not null check (capacity > 0),
  is_open     boolean not null default true
);

create table if not exists reservations (
  id             uuid primary key default gen_random_uuid(),
  code           text not null unique,
  sitting_id     int not null references sittings(id),
  full_name      text not null,
  email          text not null,
  phone          text not null,
  party_size     int not null check (party_size between 1 and 6),
  occasion       text,
  notes          text,
  status         text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  checked_in_at  timestamptz,
  created_at     timestamptz not null default now(),
  cancelled_at   timestamptz
);

-- One active reservation per email and per phone number
create unique index if not exists reservations_active_email on reservations (lower(email)) where status = 'confirmed';
create unique index if not exists reservations_active_phone on reservations (phone) where status = 'confirmed';
create index if not exists reservations_sitting on reservations (sitting_id, status);

create table if not exists waitlist (
  id          uuid primary key default gen_random_uuid(),
  full_name   text not null,
  email       text not null,
  phone       text not null,
  party_size  int not null check (party_size between 1 and 6),
  created_at  timestamptz not null default now()
);
create unique index if not exists waitlist_email on waitlist (lower(email));

-- Atomically reserve seats. Locks the sitting row so two guests can never
-- take the same last seats at the same moment.
create or replace function reserve_seats(
  p_sitting   int,
  p_name      text,
  p_email     text,
  p_phone     text,
  p_party     int,
  p_occasion  text,
  p_notes     text,
  p_code      text
) returns table (ok boolean, reason text, res_code text, seats_left int)
language plpgsql as $$
declare
  v_capacity int;
  v_open     boolean;
  v_taken    int;
begin
  select s.capacity, s.is_open into v_capacity, v_open
  from sittings s where s.id = p_sitting
  for update;

  if not found then
    return query select false, 'no_sitting'::text, null::text, 0; return;
  end if;
  if not v_open then
    return query select false, 'closed'::text, null::text, 0; return;
  end if;

  if exists (select 1 from reservations r where r.status = 'confirmed'
             and (lower(r.email) = lower(p_email) or r.phone = p_phone)) then
    return query select false, 'duplicate'::text, null::text, 0; return;
  end if;

  select coalesce(sum(r.party_size), 0) into v_taken
  from reservations r where r.sitting_id = p_sitting and r.status = 'confirmed';

  if v_taken + p_party > v_capacity then
    return query select false, 'full'::text, null::text, greatest(v_capacity - v_taken, 0); return;
  end if;

  insert into reservations (code, sitting_id, full_name, email, phone, party_size, occasion, notes)
  values (p_code, p_sitting, p_name, lower(p_email), p_phone, p_party, p_occasion, p_notes);

  return query select true, null::text, p_code, v_capacity - v_taken - p_party;
end;
$$;

-- Default sittings for opening night: 12 December 2026 (WAT, UTC+1), 50 seats each = 100 total.
-- Edit times/capacity here or directly in the table.
insert into sittings (label, starts_at, capacity)
select * from (values
  ('First sitting',  timestamptz '2026-12-12 18:30:00+01', 50),
  ('Second sitting', timestamptz '2026-12-12 21:00:00+01', 50)
) v
where not exists (select 1 from sittings);

-- Lock the tables down from Supabase's public API: only the server (direct connection) can touch them.
alter table sittings     enable row level security;
alter table reservations enable row level security;
alter table waitlist     enable row level security;
