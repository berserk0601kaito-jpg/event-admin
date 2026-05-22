-- イベントテーブル
create table events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  date text,
  location text,
  description text,
  created_at timestamptz default now()
);

-- 参加者テーブル
create table attendees (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade,
  name text not null,
  email text,
  qr_token uuid unique default gen_random_uuid(),
  checked_in boolean default false,
  checked_in_at timestamptz,
  created_at timestamptz default now()
);
