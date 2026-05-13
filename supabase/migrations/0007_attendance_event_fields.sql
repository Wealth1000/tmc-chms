-- Optional event label + offering per attendance session (leader RPC keeps working via column defaults).

alter table public.attendance_sessions
  add column if not exists event_title text not null default '';

alter table public.attendance_sessions
  add column if not exists offering_amount numeric(12, 2);

create index if not exists attendance_sessions_meeting_date_idx
  on public.attendance_sessions (meeting_date desc);

comment on column public.attendance_sessions.event_title is
  'Optional service/event name (e.g. Sunday Miracle Night). Populated when leader flow sends it.';
comment on column public.attendance_sessions.offering_amount is
  'Optional offering amount for this cell session for the given meeting date.';

-- Extend RPC: drop 4-arg version so the 6-arg signature (defaults on last two) is the only overload.

drop function if exists public.save_attendance_bundle(text, date, uuid[], jsonb);

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

