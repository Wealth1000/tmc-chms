-- Profiles + cells. Apply after `0001_auth_profiles.sql`.
-- New leaders: trigger creates `cells` row + sets `profiles.cell_slug` (default name "New cell group").

create table if not exists public.cells (
  slug text primary key,
  name text not null default 'New cell group',
  leader_user_id uuid not null references auth.users (id) on delete cascade,
  meeting_location text not null default '',
  meeting_day text not null default 'Wednesday',
  meeting_time text not null default '7:00 PM',
  description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cells_one_per_leader unique (leader_user_id)
);

create index if not exists cells_leader_user_id_idx on public.cells (leader_user_id);

alter table public.cells enable row level security;

create policy "cells_select_own_or_admin"
  on public.cells for select
  using (
    leader_user_id = (select auth.uid())
    or exists (
      select 1 from public.profiles pr
      where pr.id = (select auth.uid()) and pr.role = 'admin'
    )
  );

create policy "cells_update_own_or_admin"
  on public.cells for update
  using (
    leader_user_id = (select auth.uid())
    or exists (
      select 1 from public.profiles pr
      where pr.id = (select auth.uid()) and pr.role = 'admin'
    )
  );

-- Backfill rows for existing leaders (avoids FK failure on next statement).
insert into public.cells (slug, name, leader_user_id, meeting_location, meeting_day, meeting_time, description)
select
  p.cell_slug,
  'Cell group',
  p.id,
  '',
  'Wednesday',
  '7:00 PM',
  ''
from public.profiles p
where p.role = 'leader'
  and p.cell_slug is not null
  and length(trim(p.cell_slug)) > 0
  and not exists (select 1 from public.cells c where c.slug = p.cell_slug);

-- Orphan slugs with no cell row: clear so FK can attach.
update public.profiles p
set cell_slug = null
where p.role = 'leader'
  and p.cell_slug is not null
  and not exists (select 1 from public.cells c where c.slug = p.cell_slug);

alter table public.profiles
  add constraint profiles_cell_slug_fkey
  foreign key (cell_slug) references public.cells (slug) on delete set null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
  v_slug text;
  v_name text;
  v_full text;
begin
  v_full := coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'), ''), '');
  v_role := case
    when coalesce(new.raw_user_meta_data->>'role', '') in ('admin', 'leader')
      then new.raw_user_meta_data->>'role'
    else 'leader'
  end;

  v_slug := null;
  if v_role = 'leader' then
    v_slug := nullif(trim(new.raw_user_meta_data->>'cell_slug'), '');
    if v_slug is null or v_slug = '' then
      v_slug := 'c-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 12);
    end if;

    if exists (select 1 from public.cells where slug = v_slug) then
      raise exception 'That cell_slug is already in use. Choose another in user metadata or leave cell_slug blank for an auto-generated id.';
    end if;

    v_name := coalesce(nullif(trim(new.raw_user_meta_data->>'cell_name'), ''), 'New cell group');

    insert into public.cells (slug, name, leader_user_id, meeting_location, meeting_day, meeting_time, description)
    values (v_slug, v_name, new.id, '', 'Wednesday', '7:00 PM', '');
  end if;

  insert into public.profiles (id, full_name, role, cell_slug)
  values (
    new.id,
    v_full,
    v_role,
    v_slug
  );

  return new;
end;
$$;
