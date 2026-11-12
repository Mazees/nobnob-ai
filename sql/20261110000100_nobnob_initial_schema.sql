-- NobNob MVP. Run the full file as the migration owner on a fresh Supabase database only.
begin;

create schema if not exists nobnob_private;
revoke all on schema nobnob_private from public, anon, authenticated;

create table public.users (
    id uuid primary key default gen_random_uuid(),
    email text not null unique,
    role text not null default 'user' check (role in ('admin', 'user')),
    auth_user_id uuid unique references auth.users(id) on delete set null,
    revoked_at timestamptz,
    constraint users_normalized_email check (
        email = lower(btrim(email)) and email ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
    )
);

create table public.config (
    id smallint primary key default 1 check (id = 1),
    name text check (name is null or btrim(name) <> ''),
    description text not null default '',
    preference text not null default '',
    ai_base_url text,
    ai_model text,
    ai_key_secret_id uuid
);

create table public.accounts (
    id uuid primary key default gen_random_uuid(),
    open_id text not null unique check (btrim(open_id) <> ''),
    display_name text,
    avatar_url text,
    status text not null default 'connected'
        check (status in ('connected', 'disconnected', 'reconnect_required')),
    token_secret_id uuid,
    expires_at timestamptz,
    last_sync_at timestamptz,
    sync_state jsonb not null default '{}'::jsonb
        check (jsonb_typeof(sync_state) = 'object')
);

-- The MVP connects one TikTok identity. Disconnect keeps the same row.
create unique index accounts_singleton on public.accounts ((true));

create table public.posts (
    id uuid primary key default gen_random_uuid(),
    title text not null check (btrim(title) <> ''),
    content text not null default '',
    duration_seconds integer check (duration_seconds > 0),
    caption text not null default '',
    hashtags text[] not null default '{}',
    scheduled_at timestamptz,
    status text not null default 'draft',
    -- Store the verified full TikTok link without a query string or fragment.
    video_url text check (
        video_url ~ '^https://www[.]tiktok[.]com/@[^/[:space:]?#]+/video/[0-9]+$'
    ),
    -- Output and request metadata from the prediction service.
    prediction jsonb check (prediction is null or jsonb_typeof(prediction) = 'object'),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint posts_status_requirements check (
        (status = 'draft' and scheduled_at is null and video_url is null)
        or (status = 'scheduled' and scheduled_at is not null and video_url is null)
        or (status = 'uploaded' and video_url is not null)
    )
);

create table public.ai_messages (
    id uuid primary key default gen_random_uuid(),
    conversation_id uuid not null,
    user_id uuid not null references public.users(id) on delete restrict,
    role text not null check (role in ('user', 'assistant')),
    content text not null default '',
    created_at timestamptz not null default now(),
    request_key uuid unique,
    response_state jsonb check (response_state is null or jsonb_typeof(response_state) = 'object'),
    post_proposal jsonb check (post_proposal is null or jsonb_typeof(post_proposal) = 'object'),
    constraint ai_messages_assistant_fields check (
        role = 'assistant'
        or (request_key is null and response_state is null and post_proposal is null)
    )
);

create index posts_status_schedule_idx on public.posts (status, scheduled_at);
-- One Post per TikTok video, even if the username in the link changes.
create unique index posts_tiktok_video_unique_idx
    on public.posts ((substring(video_url from '[0-9]+$'))) where video_url is not null;
create index ai_messages_conversation_order_idx on public.ai_messages (conversation_id, created_at, id);
create index ai_messages_user_idx on public.ai_messages (user_id);

create function nobnob_private.touch_post()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    new.updated_at := now();
    return new;
end;
$$;

create trigger posts_touch_before_update
before update on public.posts
for each row execute function nobnob_private.touch_post();

-- These helpers run as the migration owner to avoid recursive users policies.
-- Membership comes from a server-bound Auth UUID and an active whitelist row.
create function nobnob_private.current_member_id()
returns uuid
language sql stable security definer
set search_path = ''
as $$
    select u.id
    from public.users as u
    where u.auth_user_id = (select auth.uid())
      and u.revoked_at is null
      and u.email = lower(btrim((select auth.jwt()) ->> 'email'));
$$;

create function nobnob_private.is_admin()
returns boolean
language sql stable security definer
set search_path = ''
as $$
    select exists (
        select 1 from public.users as u
        where u.id = (select nobnob_private.current_member_id()) and u.role = 'admin'
    );
$$;

revoke execute on function nobnob_private.touch_post() from public, anon, authenticated;
revoke execute on function nobnob_private.current_member_id() from public, anon, authenticated;
revoke execute on function nobnob_private.is_admin() from public, anon, authenticated;
grant execute on function nobnob_private.current_member_id(), nobnob_private.is_admin() to authenticated;

alter table public.users enable row level security;
alter table public.config enable row level security;
alter table public.accounts enable row level security;
alter table public.posts enable row level security;
alter table public.ai_messages enable row level security;

revoke all on public.users, public.config, public.accounts, public.posts,
    public.ai_messages from public, anon, authenticated;

grant select (id, email, role, revoked_at) on public.users to authenticated;
grant insert (email), update (revoked_at) on public.users to authenticated;
grant select (id, name, description, preference, ai_base_url, ai_model)
    on public.config to authenticated;
grant select (id, open_id, display_name, avatar_url, status, expires_at, last_sync_at)
    on public.accounts to authenticated;
grant select on public.posts to authenticated;
grant select (id, conversation_id, user_id, role, content, created_at)
    on public.ai_messages to authenticated;

create policy users_read_own_or_admin on public.users
    for select to authenticated
    using (id = (select nobnob_private.current_member_id()) or (select nobnob_private.is_admin()));

create policy users_admin_add_member on public.users
    for insert to authenticated
    with check ((select nobnob_private.is_admin()) and role = 'user'
        and auth_user_id is null and revoked_at is null);

create policy users_admin_revoke_or_restore_member on public.users
    for update to authenticated
    using ((select nobnob_private.is_admin()) and role = 'user')
    with check ((select nobnob_private.is_admin()) and role = 'user');

create policy config_member_read on public.config
    for select to authenticated using ((select nobnob_private.current_member_id()) is not null);
create policy accounts_member_read on public.accounts
    for select to authenticated using ((select nobnob_private.current_member_id()) is not null);
create policy posts_member_read on public.posts
    for select to authenticated using ((select nobnob_private.current_member_id()) is not null);
create policy messages_owner_read on public.ai_messages
    for select to authenticated using (user_id = (select nobnob_private.current_member_id()));

insert into public.config (id) values (1);

-- After migration, run a separate admin-only SQL command with the real email:
-- insert into public.users (email, role) values (lower(btrim('ADMIN_EMAIL')), 'admin');
-- The claim_whitelist_membership RPC validates the Google identity and binds auth_user_id
-- only if the normalized email is active and unbound or already bound to the caller.

-- BEGIN CLAIM WHITELIST RPC (run this block in a transaction on an existing database)
-- Requires the existing nobnob_private schema and public.users table.
grant usage on schema nobnob_private to authenticated;

create or replace function nobnob_private.claim_whitelist_membership()
returns boolean
language sql
security definer
set search_path = ''
as $$
    with caller as (
        select auth.uid() as user_id
    ), claimed as (
        update public.users as whitelist
        set auth_user_id = caller.user_id
        from caller, auth.users as auth_user
        where caller.user_id is not null
          and auth_user.id = caller.user_id
          and auth_user.email_confirmed_at is not null
          and whitelist.email =
              pg_catalog.lower(pg_catalog.btrim(auth_user.email))
          and whitelist.revoked_at is null
          and (whitelist.auth_user_id is null or whitelist.auth_user_id = caller.user_id)
          and exists (
              select 1
              from auth.identities as identity
              where identity.user_id = caller.user_id
                and identity.provider = 'google'
                and identity.identity_data -> 'email_verified' = 'true'::pg_catalog.jsonb
                and pg_catalog.lower(pg_catalog.btrim(identity.identity_data ->> 'email')) =
                    pg_catalog.lower(pg_catalog.btrim(auth_user.email))
          )
        returning 1
    )
    select exists (select 1 from claimed);
$$;

create or replace function public.claim_whitelist_membership()
returns boolean
language sql
security invoker
set search_path = ''
as $$
    select nobnob_private.claim_whitelist_membership();
$$;

revoke execute on function nobnob_private.claim_whitelist_membership() from public, anon, authenticated;
grant execute on function nobnob_private.claim_whitelist_membership() to authenticated;

revoke execute on function public.claim_whitelist_membership() from public, anon, authenticated;
grant execute on function public.claim_whitelist_membership() to authenticated;
-- END CLAIM WHITELIST RPC

-- BEGIN BEFORE USER CREATED HOOK (select this entire block to install separately)
-- Select and run this SQL, then enable the hook in the Supabase Auth Hooks Dashboard.
create or replace function public.hook_check_signup_whitelist(event jsonb)
returns jsonb
language sql
security definer
set search_path = ''
as $$
    select case
        when event -> 'user' -> 'app_metadata' ->> 'provider' = 'google'
         and pg_catalog.jsonb_typeof(event -> 'user' -> 'email') = 'string'
         and exists (
             select 1
             from public.users as whitelist
             where whitelist.email = pg_catalog.lower(pg_catalog.btrim(event -> 'user' ->> 'email'))
               and whitelist.revoked_at is null
         )
        then '{}'::pg_catalog.jsonb
        else pg_catalog.jsonb_build_object(
            'error', pg_catalog.jsonb_build_object(
                'http_code', 403,
                'message', 'Signup not permitted'
            )
        )
    end;
$$;

revoke execute on function public.hook_check_signup_whitelist(jsonb) from public, anon, authenticated;
grant execute on function public.hook_check_signup_whitelist(jsonb) to supabase_auth_admin;
-- END BEFORE USER CREATED HOOK

commit;
