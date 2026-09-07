create extension if not exists pgcrypto;

create table organisation (id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique, created_at timestamptz not null default now());
create table app_user (
  id uuid primary key default gen_random_uuid(), organisation_id uuid not null references organisation(id) on delete cascade,
  identity_subject text not null, email text not null, display_name text not null, active boolean not null default true,
  created_at timestamptz not null default now(), unique (organisation_id, identity_subject), unique (organisation_id, email)
);
create table directory_group (id uuid primary key default gen_random_uuid(), organisation_id uuid not null references organisation(id) on delete cascade, external_id text, name text not null, unique (organisation_id, name));
create table group_member (group_id uuid not null references directory_group(id) on delete cascade, user_id uuid not null references app_user(id) on delete cascade, primary key (group_id, user_id));
create table space (
  id uuid primary key default gen_random_uuid(), organisation_id uuid not null references organisation(id) on delete cascade,
  name text not null, slug text not null, description text not null default '', visibility text not null default 'private' check (visibility in ('private','organisation','public')),
  created_by uuid references app_user(id), created_at timestamptz not null default now(), unique (organisation_id, slug)
);
create table page (
  id uuid primary key default gen_random_uuid(), space_id uuid not null references space(id) on delete cascade,
  parent_id uuid references page(id) on delete set null, slug text not null, title text not null,
  status text not null default 'draft' check (status in ('draft','in_review','published','archived')),
  created_by uuid references app_user(id), current_version integer not null default 1, published_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (space_id, slug)
);
create table page_version (
  id uuid primary key default gen_random_uuid(), page_id uuid not null references page(id) on delete cascade,
  version integer not null, title text not null, body jsonb not null, body_text text not null,
  change_note text not null default '', created_by uuid references app_user(id), created_at timestamptz not null default now(), unique (page_id, version)
);
create index page_version_search_idx on page_version using gin (to_tsvector('english', title || ' ' || body_text));
create table page_block (
  id uuid primary key default gen_random_uuid(), page_version_id uuid not null references page_version(id) on delete cascade,
  position integer not null, block_type text not null check (block_type in ('paragraph','heading','list','code','callout','table','embed')),
  content jsonb not null, unique (page_version_id, position)
);
create table attachment (
  id uuid primary key default gen_random_uuid(), page_id uuid not null references page(id) on delete cascade,
  object_key text not null unique, filename text not null, media_type text not null, size_bytes bigint not null check (size_bytes >= 0), created_at timestamptz not null default now()
);
create table page_comment (
  id uuid primary key default gen_random_uuid(), page_id uuid not null references page(id) on delete cascade,
  parent_id uuid references page_comment(id) on delete cascade, author_id uuid references app_user(id), body text not null,
  resolved_at timestamptz, created_at timestamptz not null default now()
);
create table page_permission (
  id uuid primary key default gen_random_uuid(), page_id uuid references page(id) on delete cascade, space_id uuid references space(id) on delete cascade,
  principal_type text not null check (principal_type in ('user','group','organisation','public')), principal_id uuid,
  capability text not null check (capability in ('read','edit','admin')), granted_by uuid references app_user(id), created_at timestamptz not null default now(),
  check ((page_id is not null) <> (space_id is not null))
);
create index page_permission_lookup_idx on page_permission (principal_type, principal_id, capability);
create table template (id uuid primary key default gen_random_uuid(), organisation_id uuid not null references organisation(id) on delete cascade, name text not null, body jsonb not null, created_by uuid references app_user(id), unique (organisation_id, name));
create table label (id uuid primary key default gen_random_uuid(), organisation_id uuid not null references organisation(id) on delete cascade, name text not null, color text not null default '#A3FF12', unique (organisation_id, name));
create table page_label (page_id uuid not null references page(id) on delete cascade, label_id uuid not null references label(id) on delete cascade, primary key (page_id, label_id));
create table content_review (
  id uuid primary key default gen_random_uuid(), page_id uuid not null references page(id) on delete cascade,
  requested_by uuid references app_user(id), reviewer_id uuid references app_user(id), status text not null default 'pending' check (status in ('pending','approved','changes_requested')),
  notes text not null default '', requested_at timestamptz not null default now(), completed_at timestamptz
);
create table audit_event (id bigint generated always as identity primary key, organisation_id uuid not null references organisation(id) on delete cascade, actor_id text not null, action text not null, entity_type text not null, entity_id text not null, payload jsonb not null default '{}'::jsonb, occurred_at timestamptz not null default now());
create index audit_event_org_time_idx on audit_event (organisation_id, occurred_at desc);
create table role_policy (organisation_id uuid not null references organisation(id) on delete cascade, role_key text not null, permissions text[] not null default '{}', updated_by text not null, updated_at timestamptz not null default now(), primary key (organisation_id, role_key));
