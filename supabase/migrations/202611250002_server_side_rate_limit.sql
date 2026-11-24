create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to service_role;

create table if not exists private.message_rate_limits (
  ip_hash text primary key check (ip_hash ~ '^[0-9a-f]{64}$'),
  window_started_at timestamptz not null,
  request_count integer not null check (request_count > 0),
  expires_at timestamptz not null
);

create index if not exists message_rate_limits_expires_at_idx
  on private.message_rate_limits (expires_at);

alter table private.message_rate_limits enable row level security;
revoke all on table private.message_rate_limits from public, anon, authenticated;
grant select, insert, update, delete on table private.message_rate_limits to service_role;

revoke all on table public.admin_users from public, anon, authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

create or replace function public.consume_message_rate_limit(
  p_ip_hash text,
  p_max_requests integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_now timestamptz := pg_catalog.clock_timestamp();
  v_request_count integer;
begin
  if p_ip_hash !~ '^[0-9a-f]{64}$'
    or p_max_requests < 1
    or p_max_requests > 100
    or p_window_seconds < 30
    or p_window_seconds > 86400
  then
    raise exception 'Invalid rate limit parameters';
  end if;

  delete from private.message_rate_limits
  where ip_hash in (
    select expired.ip_hash
    from private.message_rate_limits as expired
    where expired.expires_at <= v_now
    order by expired.expires_at
    limit 100
  );

  insert into private.message_rate_limits as existing (
    ip_hash,
    window_started_at,
    request_count,
    expires_at
  )
  values (
    p_ip_hash,
    v_now,
    1,
    v_now + pg_catalog.make_interval(secs => p_window_seconds)
  )
  on conflict (ip_hash) do update
  set
    window_started_at = case
      when existing.window_started_at <= v_now - pg_catalog.make_interval(secs => p_window_seconds)
        then v_now
      else existing.window_started_at
    end,
    request_count = case
      when existing.window_started_at <= v_now - pg_catalog.make_interval(secs => p_window_seconds)
        then 1
      else existing.request_count + 1
    end,
    expires_at = case
      when existing.window_started_at <= v_now - pg_catalog.make_interval(secs => p_window_seconds)
        then v_now + pg_catalog.make_interval(secs => p_window_seconds)
      else existing.expires_at
    end
  returning request_count into v_request_count;

  return v_request_count <= p_max_requests;
end;
$$;

revoke all on function public.consume_message_rate_limit(text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.consume_message_rate_limit(text, integer, integer)
  to service_role;

drop policy if exists "Anyone can insert messages" on public.messages;
revoke insert on table public.messages from anon, authenticated;
