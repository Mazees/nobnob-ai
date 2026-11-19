-- SQL tambahan setelah 20261110000100_nobnob_initial_schema.sql.
-- Mada mereview dan menjalankan di Supabase SQL Editor. Bukan migrasi ulang schema awal.
begin;

grant insert (title, content, duration_seconds, caption, hashtags, scheduled_at, status, video_url)
    on public.posts to authenticated;
grant update (title, content, duration_seconds, caption, hashtags, scheduled_at, status, video_url, prediction)
    on public.posts to authenticated;
grant delete on public.posts to authenticated;

-- SELECT policy posts_member_read sudah dibuat pada schema awal.
drop policy if exists posts_member_insert on public.posts;
create policy posts_member_insert on public.posts for insert to authenticated
    with check ((select nobnob_private.current_member_id()) is not null);

drop policy if exists posts_member_update on public.posts;
create policy posts_member_update on public.posts for update to authenticated
    using ((select nobnob_private.current_member_id()) is not null)
    with check ((select nobnob_private.current_member_id()) is not null);

drop policy if exists posts_member_delete on public.posts;
create policy posts_member_delete on public.posts for delete to authenticated
    using ((select nobnob_private.current_member_id()) is not null);

create index if not exists posts_updated_order_idx on public.posts (updated_at desc, id desc);
-- Indeks unik ID video pada schema awal tetap menjamin satu video untuk satu Post,
-- termasuk dua permintaan penautan bersamaan.
commit;
