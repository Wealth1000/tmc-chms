-- Leaders created before `0002_cells.sql` often have `profiles.cell_slug` = null (trigger never ran).
-- This RPC + one-time backfill fixes that. App calls `ensure_leader_cell_for_current_user()` after login / on profile.

create or replace function public.ensure_leader_cell_for_current_user()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  v_role text;
  existing_slug text;
  v_slug text;
begin
  if uid is null then
    return null;
  end if;

  select role, cell_slug into v_role, existing_slug
  from public.profiles
  where id = uid;

  if v_role is null or v_role <> 'leader' then
    return null;
  end if;

  if existing_slug is not null and length(trim(existing_slug)) > 0 then
    if exists (select 1 from public.cells c where c.slug = trim(existing_slug)) then
      return trim(existing_slug);
    end if;
  end if;

  select c.slug into v_slug from public.cells c where c.leader_user_id = uid limit 1;
  if v_slug is not null then
    update public.profiles
    set cell_slug = v_slug, updated_at = now()
    where id = uid;
    return v_slug;
  end if;

  v_slug := 'c-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 12);
  insert into public.cells (slug, name, leader_user_id, meeting_location, meeting_day, meeting_time, description)
  values (v_slug, 'New cell group', uid, '', 'Wednesday', '7:00 PM', '');
  update public.profiles
  set cell_slug = v_slug, updated_at = now()
  where id = uid;
  return v_slug;
end;
$$;

revoke all on function public.ensure_leader_cell_for_current_user() from public;
grant execute on function public.ensure_leader_cell_for_current_user() to authenticated;

-- One-time: fix existing leader rows in the database (no app required).
do $$
declare
  r record;
  v_slug text;
begin
  for r in
    select p.id
    from public.profiles p
    where p.role = 'leader'
      and (
        p.cell_slug is null
        or length(trim(p.cell_slug)) = 0
        or not exists (select 1 from public.cells c where c.slug = trim(p.cell_slug))
      )
  loop
    select c.slug into v_slug from public.cells c where c.leader_user_id = r.id limit 1;
    if v_slug is not null then
      update public.profiles set cell_slug = v_slug, updated_at = now() where id = r.id;
    else
      v_slug := 'c-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 12);
      insert into public.cells (slug, name, leader_user_id, meeting_location, meeting_day, meeting_time, description)
      values (v_slug, 'New cell group', r.id, '', 'Wednesday', '7:00 PM', '');
      update public.profiles set cell_slug = v_slug, updated_at = now() where id = r.id;
    end if;
  end loop;
end;
$$;
