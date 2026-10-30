-- Paste once in Supabase → SQL Editor → Run.
-- Service role (server only) reads/writes these. Do not expose that key in the browser.

create table if not exists public.workspaces (
  owner_id text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.waitlist (
  id text primary key,
  email text not null unique,
  restaurant text not null,
  created_at timestamptz not null default now()
);

alter table public.workspaces enable row level security;
alter table public.waitlist enable row level security;
