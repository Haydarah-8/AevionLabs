-- Allow images, video, audio, and PDFs in the public blog-media bucket.
update storage.buckets
set
  public = true,
  file_size_limit = 104857600,
  allowed_mime_types = array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/ogg',
    'audio/mpeg',
    'audio/mp4',
    'audio/wav',
    'audio/webm',
    'audio/ogg',
    'application/pdf'
  ]
where id = 'blog-media';

drop policy if exists "authenticated_upload_blog_media" on storage.objects;
create policy "authenticated_upload_blog_media"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'blog-media'
  and coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
);

drop policy if exists "authenticated_update_blog_media" on storage.objects;
create policy "authenticated_update_blog_media"
on storage.objects for update
to authenticated
using (
  bucket_id = 'blog-media'
  and coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
)
with check (
  bucket_id = 'blog-media'
  and coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
);
