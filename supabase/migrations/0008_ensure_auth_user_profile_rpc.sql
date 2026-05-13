-- Backfill public.profiles for auth users missing a row (e.g. user created before trigger, or manual auth insert).

create or replace function public.ensure_auth_user_profile()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  insert into public.profiles (id, full_name, role, cell_slug)
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
    case
      when coalesce(
        nullif(trim(coalesce((select raw_user_meta_data->>'role' from auth.users where id = v_uid), '')), ''),
        ''
      ) in ('admin', 'leader')
        then trim((select raw_user_meta_data->>'role' from auth.users where id = v_uid))
      else 'leader'
    end,
    nullif(trim(coalesce((select raw_user_meta_data->>'cell_slug' from auth.users where id = v_uid), '')), '')
  )
  on conflict (id) do nothing;
end;
$$;

revoke all on function public.ensure_auth_user_profile() from public;
grant execute on function public.ensure_auth_user_profile() to authenticated;
