-- Phase 2 schema: shared group favorites and group invitations.

do $$ begin
  create type invite_status as enum ('pending', 'accepted', 'declined', 'expired', 'revoked');
exception when duplicate_object then null; end $$;

-- Shared favorites within a group
create table if not exists group_favorites (
  group_id uuid not null references groups(id) on delete cascade,
  place_id text not null references places(id) on delete cascade,
  added_by_user_id uuid not null references users(id) on delete restrict,
  note text,
  created_at timestamptz not null default now(),
  primary key (group_id, place_id)
);

create index if not exists group_favorites_group_created_idx
  on group_favorites (group_id, created_at desc);
create index if not exists group_favorites_added_by_idx
  on group_favorites (added_by_user_id, created_at desc);

-- Group invitations
create table if not exists group_invites (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  invited_by_user_id uuid not null references users(id) on delete restrict,
  invited_user_id uuid references users(id) on delete cascade,
  email text,
  token text not null unique,
  status invite_status not null default 'pending',
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  accepted_at timestamptz
);

create index if not exists group_invites_group_status_idx
  on group_invites (group_id, status);
create index if not exists group_invites_token_idx on group_invites (token);

-- Prevent duplicate pending invites for the same email in a group
create unique index if not exists group_invites_unique_pending_email
  on group_invites (group_id, lower(email))
  where status = 'pending' and email is not null;
