-- Profiles linked to auth.users. Run via Supabase SQL editor or `supabase db push`.
-- Apply `0002_cells.sql` after this file so leaders get a `cells` row from the signup trigger.
-- After migrations: create Auth users in Dashboard; optional raw_user_meta_data keys:
--   role: "admin" | "leader"
--   cell_slug: optional; if omitted for a leader, the trigger assigns a generated slug
--   cell_name: optional display name for the new cell (default "New cell group")

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text not null default '',
  role text not null default 'leader' check (role in ('admin', 'leader')),
  cell_slug text,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, cell_slug)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    case
      when coalesce(new.raw_user_meta_data->>'role', '') in ('admin', 'leader')
        then new.raw_user_meta_data->>'role'
      else 'leader'
    end,
    nullif(new.raw_user_meta_data->>'cell_slug', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
