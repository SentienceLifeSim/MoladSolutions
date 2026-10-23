-- Sentience Tester Hub (sublimelabs.tech/testers), 2026-10-23.
-- Lives in the Sentience Supabase project next to tester_codes, which is how
-- testers sign in. Service role access only; the site's API does every read.

create table if not exists tester_bugs (
  id            bigserial primary key,
  title         text not null,
  happened      text not null,
  steps         text,
  expected      text,
  platform      text not null default 'ios',
  device        text,
  app_version   text,
  severity      text not null default 'minor',
  area          text,
  status        text not null default 'new',
  owner_note    text,
  duplicate_of  bigint references tester_bugs(id),
  reporter_code text not null,
  reporter_name text,
  shots         jsonb not null default '[]'::jsonb,
  metoo         int not null default 0,
  comments      int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists tester_bugs_created on tester_bugs (created_at desc);

create table if not exists tester_bug_metoo (
  bug_id     bigint not null references tester_bugs(id) on delete cascade,
  code       text not null,
  created_at timestamptz not null default now(),
  primary key (bug_id, code)
);

create table if not exists tester_bug_comments (
  id         bigserial primary key,
  bug_id     bigint not null references tester_bugs(id) on delete cascade,
  code       text not null,
  name       text,
  owner      boolean not null default false,
  body       text not null,
  created_at timestamptz not null default now()
);
create index if not exists tester_bug_comments_bug on tester_bug_comments (bug_id, created_at);

-- Owner posts: 'focus' = what to test this week, 'build' = release notes.
create table if not exists tester_posts (
  id         bigserial primary key,
  kind       text not null,
  title      text not null,
  body       text,
  version    text,
  created_at timestamptz not null default now()
);

alter table tester_bugs enable row level security;
alter table tester_bug_metoo enable row level security;
alter table tester_bug_comments enable row level security;
alter table tester_posts enable row level security;

-- Screenshots: public bucket, written only by the service role.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('tester-shots', 'tester-shots', true, 52428800,
        array['image/jpeg','image/png','image/webp','video/mp4','video/quicktime','video/webm'])
on conflict (id) do nothing;

-- 2026-10-23: a report is a bug, a suggestion (idea) or a "couldn't find a bug" check-in (clear).
-- All three count toward a tester's monthly number.
alter table tester_bugs add column if not exists kind text not null default 'bug';
update tester_bugs set kind = 'idea' where id = 2 and title like 'Newborn options%';
