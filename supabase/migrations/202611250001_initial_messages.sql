create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  constraint messages_content_not_blank check (btrim(content) <> ''),
  constraint messages_content_max_length check (char_length(content) <= 1000)
);

create index if not exists messages_created_at_idx
  on public.messages (created_at desc);

create index if not exists messages_is_read_idx
  on public.messages (is_read);

alter table public.messages enable row level security;

revoke all on table public.messages from anon, authenticated;
grant insert (content) on table public.messages to anon, authenticated;
grant select (id, content, is_read, created_at) on table public.messages to authenticated;
grant update (is_read) on table public.messages to authenticated;
grant delete on table public.messages to authenticated;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create policy "Anyone can insert messages"
  on public.messages
  for insert
  to anon, authenticated
  with check (
    btrim(content) <> ''
    and char_length(content) <= 1000
  );

create policy "Admins can read messages"
  on public.messages
  for select
  to authenticated
  using (public.is_admin());

create policy "Admins can mark messages read"
  on public.messages
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin() and is_read = true);

create policy "Admins can delete messages"
  on public.messages
  for delete
  to authenticated
  using (public.is_admin());

comment on policy "Anyone can insert messages" on public.messages is
  'Allows public and authenticated visitors to create validated messages only.';
comment on policy "Admins can read messages" on public.messages is
  'Allows only users listed in public.admin_users to read the inbox.';
comment on policy "Admins can mark messages read" on public.messages is
  'Allows only allowlisted admins to update is_read; clients cannot change content.';
comment on policy "Admins can delete messages" on public.messages is
  'Allows only allowlisted admins to delete messages.';
