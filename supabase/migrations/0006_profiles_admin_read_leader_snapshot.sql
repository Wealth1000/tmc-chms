-- Admins can read all profiles (for cell directory leader names).
-- RPC joins auth.users for email when caller is admin or the subject user.

create policy "profiles_select_if_admin"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles me
      where me.id = (select auth.uid()) and me.role = 'admin'
    )
  );

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
      or exists (
        select 1 from public.profiles me
        where me.id = (select auth.uid()) and me.role = 'admin'
      )
    );
$$;

revoke all on function public.get_cell_leader_snapshots(uuid[]) from public;
grant execute on function public.get_cell_leader_snapshots(uuid[]) to authenticated;
