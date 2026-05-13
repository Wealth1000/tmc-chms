-- Members roster + attendance sessions. Apply after 0002_cells.sql.
-- RLS: cell leaders manage members for their cell; admins manage all.

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  cell_slug text not null references public.cells (slug) on delete cascade,
  full_name text not null,
  email text not null,
  date_of_birth text not null default '',
  area text not null default '',
  is_student boolean not null default false,
  occupation text not null default '',
  foundation_status text not null default 'yet_to_start'
    check (foundation_status in ('yet_to_start', 'started', 'completed')),
  member_status text not null default 'active'
    check (member_status in ('active', 'inactive', 'dormant')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists members_cell_slug_email_lower_key
  on public.members (cell_slug, lower(trim(email)));

create index if not exists members_cell_slug_idx on public.members (cell_slug);

alter table public.members enable row level security;

create policy "members_select_own_cell_or_admin"
  on public.members for select
  using (
    exists (
      select 1 from public.cells c
      where c.slug = members.cell_slug and c.leader_user_id = (select auth.uid())
    )
    or exists (
      select 1 from public.profiles pr
      where pr.id = (select auth.uid()) and pr.role = 'admin'
    )
  );

create policy "members_insert_own_cell_or_admin"
  on public.members for insert
  with check (
    exists (
      select 1 from public.cells c
      where c.slug = members.cell_slug and c.leader_user_id = (select auth.uid())
    )
    or exists (
      select 1 from public.profiles pr
      where pr.id = (select auth.uid()) and pr.role = 'admin'
    )
  );

create policy "members_update_own_cell_or_admin"
  on public.members for update
  using (
    exists (
      select 1 from public.cells c
      where c.slug = members.cell_slug and c.leader_user_id = (select auth.uid())
    )
    or exists (
      select 1 from public.profiles pr
      where pr.id = (select auth.uid()) and pr.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.cells c
      where c.slug = members.cell_slug and c.leader_user_id = (select auth.uid())
    )
    or exists (
      select 1 from public.profiles pr
      where pr.id = (select auth.uid()) and pr.role = 'admin'
    )
  );

create policy "members_delete_own_cell_or_admin"
  on public.members for delete
  using (
    exists (
      select 1 from public.cells c
      where c.slug = members.cell_slug and c.leader_user_id = (select auth.uid())
    )
    or exists (
      select 1 from public.profiles pr
      where pr.id = (select auth.uid()) and pr.role = 'admin'
    )
  );

-- Attendance: one session per save; presence rows link members; invitees stored as JSON.

create table if not exists public.attendance_sessions (
  id uuid primary key default gen_random_uuid(),
  cell_slug text not null references public.cells (slug) on delete cascade,
  meeting_date date not null,
  recorded_by uuid not null references auth.users (id) on delete restrict,
  recorded_at timestamptz not null default now(),
  member_present_count int not null default 0,
  invitee_count int not null default 0,
  invitees jsonb not null default '[]'::jsonb
);

create index if not exists attendance_sessions_cell_slug_idx
  on public.attendance_sessions (cell_slug, recorded_at desc);

create table if not exists public.attendance_presence (
  session_id uuid not null references public.attendance_sessions (id) on delete cascade,
  member_id uuid not null references public.members (id) on delete cascade,
  primary key (session_id, member_id)
);

create index if not exists attendance_presence_member_id_idx on public.attendance_presence (member_id);

alter table public.attendance_sessions enable row level security;
alter table public.attendance_presence enable row level security;

create policy "attendance_sessions_select_own_cell_or_admin"
  on public.attendance_sessions for select
  using (
    exists (
      select 1 from public.cells c
      where c.slug = attendance_sessions.cell_slug and c.leader_user_id = (select auth.uid())
    )
    or exists (
      select 1 from public.profiles pr
      where pr.id = (select auth.uid()) and pr.role = 'admin'
    )
  );

create policy "attendance_sessions_insert_own_cell_or_admin"
  on public.attendance_sessions for insert
  with check (
    exists (
      select 1 from public.cells c
      where c.slug = attendance_sessions.cell_slug and c.leader_user_id = (select auth.uid())
    )
    or exists (
      select 1 from public.profiles pr
      where pr.id = (select auth.uid()) and pr.role = 'admin'
    )
  );

create policy "attendance_presence_select_own_cell_or_admin"
  on public.attendance_presence for select
  using (
    exists (
      select 1 from public.attendance_sessions s
      join public.cells c on c.slug = s.cell_slug
      where s.id = attendance_presence.session_id
        and (
          c.leader_user_id = (select auth.uid())
          or exists (
            select 1 from public.profiles pr
            where pr.id = (select auth.uid()) and pr.role = 'admin'
          )
        )
    )
  );

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
          or exists (
            select 1 from public.profiles pr
            where pr.id = (select auth.uid()) and pr.role = 'admin'
          )
        )
    )
  );

-- Atomic save: session + presence rows (bypasses RLS safely after authz checks).

create or replace function public.save_attendance_bundle(
  p_cell_slug text,
  p_meeting_date date,
  p_member_ids uuid[],
  p_invitees jsonb
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
    or exists (select 1 from public.profiles p where p.id = v_uid and p.role = 'admin')
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
    invitees
  )
  values (
    p_cell_slug,
    p_meeting_date,
    v_uid,
    coalesce(array_length(v_ids, 1), 0),
    coalesce(jsonb_array_length(v_inv), 0),
    v_inv
  )
  returning id into v_sid;

  insert into public.attendance_presence (session_id, member_id)
  select v_sid, x from unnest(v_ids) as x;

  return v_sid;
end;
$$;

revoke all on function public.save_attendance_bundle(text, date, uuid[], jsonb) from public;
grant execute on function public.save_attendance_bundle(text, date, uuid[], jsonb) to authenticated;
