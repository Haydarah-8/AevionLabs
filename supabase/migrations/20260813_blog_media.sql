-- ─────────────────────────────────────────────
-- 3) Blog media (public read, admin upload via service_role)
-- ─────────────────────────────────────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'blog-media',
  'blog-media',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public_read_blog_media" on storage.objects;
create policy "public_read_blog_media"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'blog-media');
