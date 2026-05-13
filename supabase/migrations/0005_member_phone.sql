-- Optional phone on each member roster row.

alter table public.members
  add column if not exists phone text not null default '';
