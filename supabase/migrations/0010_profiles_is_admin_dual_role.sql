-- Dual role: leaders with admin powers use role='leader' + is_admin=true + cell_slug.
-- Pure admins: role='admin' (is_admin backfilled true). RLS uses auth_is_admin() everywhere.

alter table public.profiles
  add column if not exists is_admin boolean not null default false;

update public.profiles
set is_admin = true
where role = 'admin' and is_admin = false;

create or replace function public.auth_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and (p.role = 'admin' or p.is_admin = true)
  );
$$;

-- cells
drop policy if exists "cells_select_own_or_admin" on public.cells;
create policy "cells_select_own_or_admin"
  on public.cells for select
  using (
    leader_user_id = (select auth.uid())
    or (select public.auth_is_admin())
  );

drop policy if exists "cells_update_own_or_admin" on public.cells;
create policy "cells_update_own_or_admin"
  on public.cells for update
  using (
    leader_user_id = (select auth.uid())
    or (select public.auth_is_admin())
  );

-- members
drop policy if exists "members_select_own_cell_or_admin" on public.members;
create policy "members_select_own_cell_or_admin"
  on public.members for select
  using (
    exists (
      select 1 from public.cells c
      where c.slug = members.cell_slug and c.leader_user_id = (select auth.uid())
    )
    or (select public.auth_is_admin())
  );

drop policy if exists "members_insert_own_cell_or_admin" on public.members;
create policy "members_insert_own_cell_or_admin"
  on public.members for insert
  with check (
    exists (
      select 1 from public.cells c
      where c.slug = members.cell_slug and c.leader_user_id = (select auth.uid())
    )
    or (select public.auth_is_admin())
  );

drop policy if exists "members_update_own_cell_or_admin" on public.members;
create policy "members_update_own_cell_or_admin"
  on public.members for update
  using (
    exists (
      select 1 from public.cells c
      where c.slug = members.cell_slug and c.leader_user_id = (select auth.uid())
    )
    or (select public.auth_is_admin())
  )
  with check (
    exists (
      select 1 from public.cells c
      where c.slug = members.cell_slug and c.leader_user_id = (select auth.uid())
    )
    or (select public.auth_is_admin())
  );

drop policy if exists "members_delete_own_cell_or_admin" on public.members;
create policy "members_delete_own_cell_or_admin"
  on public.members for delete
  using (
    exists (
      select 1 from public.cells c
      where c.slug = members.cell_slug and c.leader_user_id = (select auth.uid())
    )
    or (select public.auth_is_admin())
  );

-- attendance_sessions
drop policy if exists "attendance_sessions_select_own_cell_or_admin" on public.attendance_sessions;
create policy "attendance_sessions_select_own_cell_or_admin"
  on public.attendance_sessions for select
  using (
    exists (
      select 1 from public.cells c
      where c.slug = attendance_sessions.cell_slug and c.leader_user_id = (select auth.uid())
    )
    or (select public.auth_is_admin())
  );

drop policy if exists "attendance_sessions_insert_own_cell_or_admin" on public.attendance_sessions;
create policy "attendance_sessions_insert_own_cell_or_admin"
  on public.attendance_sessions for insert
  with check (
    exists (
      select 1 from public.cells c
      where c.slug = attendance_sessions.cell_slug and c.leader_user_id = (select auth.uid())
    )
    or (select public.auth_is_admin())
  );

-- attendance_presence
drop policy if exists "attendance_presence_select_own_cell_or_admin" on public.attendance_presence;
create policy "attendance_presence_select_own_cell_or_admin"
  on public.attendance_presence for select
  using (
    exists (
      select 1 from public.attendance_sessions s
      join public.cells c on c.slug = s.cell_slug
      where s.id = attendance_presence.session_id
        and (
          c.leader_user_id = (select auth.uid())
          or (select public.auth_is_admin())
        )
    )
  );

drop policy if exists "attendance_presence_insert_own_cell_or_admin" on public.attendance_presence;
create policy "attendance_presence_insert_own_cell_or_admin"
  on public.attendance_presence for insert
  with check (
    exists (
      select 1 from public.attendance_sessions s
      join public.members m on m.id = attendance_presence.member_id
      where s.id = attendance_presence.session_id
        and m.cell_slug = s.cell_slug
        and (
          exists (
            select 1 from public.cells c
            where c.slug = s.cell_slug and c.leader_user_id = (select auth.uid())
          )
          or (select public.auth_is_admin())
        )
    )
  );

-- save_attendance_bundle (latest 6-arg signature from 0007)
create or replace function public.save_attendance_bundle(
  p_cell_slug text,
  p_meeting_date date,
  p_member_ids uuid[],
  p_invitees jsonb,
  p_event_title text default '',
  p_offering_amount numeric default null
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_sid uuid;
  v_mid uuid;
  v_inv jsonb := coalesce(p_invitees, '[]'::jsonb);
  v_ids uuid[] := coalesce(p_member_ids, array[]::uuid[]);
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  if not (
    exists (select 1 from public.cells c where c.slug = p_cell_slug and c.leader_user_id = v_uid)
    or (select public.auth_is_admin())
  ) then
    raise exception 'forbidden';
  end if;

  foreach v_mid in array v_ids
  loop
    if not exists (
      select 1 from public.members m where m.id = v_mid and m.cell_slug = p_cell_slug
    ) then
      raise exception 'invalid member for cell';
    end if;
  end loop;

  insert into public.attendance_sessions (
    cell_slug,
    meeting_date,
    recorded_by,
    member_present_count,
    invitee_count,
    invitees,
    event_title,
    offering_amount
  )
  values (
    p_cell_slug,
    p_meeting_date,
    v_uid,
    coalesce(array_length(v_ids, 1), 0),
    coalesce(jsonb_array_length(v_inv), 0),
    v_inv,
    coalesce(nullif(trim(p_event_title), ''), ''),
    p_offering_amount
  )
  returning id into v_sid;

  insert into public.attendance_presence (session_id, member_id)
  select v_sid, x from unnest(v_ids) as x;

  return v_sid;
end;
$$;

revoke all on function public.save_attendance_bundle(text, date, uuid[], jsonb, text, numeric) from public;
grant execute on function public.save_attendance_bundle(text, date, uuid[], jsonb, text, numeric) to authenticated;

-- New signups: is_admin when metadata role is admin.
create or replace function public.ensure_auth_user_profile()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_role text;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  v_role := case
    when coalesce(
      nullif(trim(coalesce((select raw_user_meta_data->>'role' from auth.users where id = v_uid), '')), ''),
      ''
    ) in ('admin', 'leader')
      then trim((select raw_user_meta_data->>'role' from auth.users where id = v_uid))
    else 'leader'
  end;

  insert into public.profiles (id, full_name, role, is_admin, cell_slug)
  values (
    v_uid,
    coalesce(
      nullif(
        trim(
          coalesce(
            (select raw_user_meta_data->>'full_name' from auth.users where id = v_uid),
            (select raw_user_meta_data->>'name' from auth.users where id = v_uid),
            ''
          )
        ),
        ''
      ),
      ''
    ),
    v_role,
    v_role = 'admin',
    nullif(trim(coalesce((select raw_user_meta_data->>'cell_slug' from auth.users where id = v_uid), '')), '')
  )
  on conflict (id) do nothing;
end;
$$;
