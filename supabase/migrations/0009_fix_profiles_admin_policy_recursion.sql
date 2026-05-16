-- Fix infinite recursion: policies on public.profiles cannot SELECT public.profiles (RLS re-enters the same policy).
-- Use a SECURITY DEFINER helper so the admin check does not apply RLS to the inner read.

create or replace function public.auth_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  );
$$;

revoke all on function public.auth_is_admin() from public;
grant execute on function public.auth_is_admin() to authenticated;

drop policy if exists "profiles_select_if_admin" on public.profiles;

create policy "profiles_select_if_admin"
  on public.profiles for select
  using ( (select public.auth_is_admin()) );

create or replace function public.get_cell_leader_snapshots(p_ids uuid[])
returns table(user_id uuid, full_name text, email text)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    trim(coalesce(p.full_name, '')),
    trim(coalesce(au.email::text, ''))
  from public.profiles p
  inner join auth.users au on au.id = p.id
  where p.id = any(p_ids)
    and (
      p.id = (select auth.uid())
      or (select public.auth_is_admin())
    );
$$;
