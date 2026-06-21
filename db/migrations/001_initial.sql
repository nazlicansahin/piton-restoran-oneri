-- Phase 1 schema for piton-restoran-oneri
-- Identity comes from Firebase Auth; Postgres owns app data.

create extension if not exists "pgcrypto";

-- Enum types
do $$ begin
  create type price_tier as enum ('budget', 'mid', 'premium');
exception when duplicate_object then null; end $$;

do $$ begin
  create type group_role as enum ('owner', 'admin', 'member');
exception when duplicate_object then null; end $$;

do $$ begin
  create type group_visibility as enum ('private', 'invite_only', 'public');
exception when duplicate_object then null; end $$;

-- Core identity / profile
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  firebase_uid text not null unique,
  email text,
  display_name text,
  photo_url text,
  locale text not null default 'tr',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists users_created_at_idx on users (created_at desc);

-- User preference profile
create table if not exists user_preferences (
  user_id uuid primary key references users(id) on delete cascade,
  max_distance_km numeric(4,2) not null default 3.00
    check (max_distance_km > 0 and max_distance_km <= 50),
  price_preference price_tier,
  cuisines text[] not null default '{}',
  updated_at timestamptz not null default now()
);

-- Place snapshot catalog (only for interacted places)
create table if not exists places (
  id text primary key,                 -- OSM id, e.g. "node/12345"
  name text,
  cuisine text,
  lat double precision not null,
  lng double precision not null,
  address text,
  source text not null default 'overpass',
  last_seen_at timestamptz not null default now()
);

create index if not exists places_last_seen_at_idx on places (last_seen_at desc);

-- Personal favorites
create table if not exists favorites (
  user_id uuid not null references users(id) on delete cascade,
  place_id text not null references places(id) on delete cascade,
  note text,
  created_at timestamptz not null default now(),
  primary key (user_id, place_id)
);

create index if not exists favorites_user_created_idx on favorites (user_id, created_at desc);
create index if not exists favorites_place_idx on favorites (place_id);

-- Groups
create table if not exists groups (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  name text not null,
  description text,
  owner_user_id uuid not null references users(id) on delete restrict,
  visibility group_visibility not null default 'private',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists groups_owner_idx on groups (owner_user_id);
create index if not exists groups_created_idx on groups (created_at desc);

-- Group memberships
create table if not exists group_members (
  group_id uuid not null references groups(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  role group_role not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create index if not exists group_members_user_idx on group_members (user_id, joined_at desc);
