import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

const MAX_BYTES = 100 * 1024 * 1024;

const EXT_BY_MIME = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
  ["image/svg+xml", "svg"],
  ["video/mp4", "mp4"],
  ["video/webm", "webm"],
  ["video/quicktime", "mov"],
  ["video/ogg", "ogv"],
  ["audio/mpeg", "mp3"],
  ["audio/mp4", "m4a"],
  ["audio/wav", "wav"],
  ["audio/webm", "weba"],
  ["audio/ogg", "ogg"],
  ["application/pdf", "pdf"],
]);

const WEBSITE_IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MIME_BY_EXT = new Map(
  [...EXT_BY_MIME.entries()].map(([mime, ext]) => [ext, mime]),
);

function extensionFromName(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return /^[a-z0-9]{1,8}$/.test(ext) ? ext : "";
}

function sanitizeOwner(raw: unknown) {
  const value = String(raw || "")
    .replace(/[^a-zA-Z0-9/_-]/g, "")
    .replace(/\/{2,}/g, "/")
    .replace(/^\/+|\/+$/g, "")
    .slice(0, 120);
  if (!value) return "cms";
  if (!value.includes("/")) return `posts/${value}`;
  return value;
}

function resolveType(contentType: string, filename: string) {
  const mime = contentType.split(";")[0].trim().toLowerCase();
  if (EXT_BY_MIME.has(mime)) return { mime, ext: EXT_BY_MIME.get(mime)! };
  const ext = extensionFromName(filename);
  const fromName = MIME_BY_EXT.get(ext);
  if (fromName) return { mime: fromName, ext };
  return null;
}

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const body = (await request.json()) as {
      postId?: string;
      owner?: string;
      filename?: string;
      contentType?: string;
      size?: number;
    };
    const owner = sanitizeOwner(body.owner || body.postId);
    const filename = String(body.filename || "upload");
    const resolved = resolveType(String(body.contentType || ""), filename);
    if (!owner) {
      return NextResponse.json({ error: "Missing upload owner" }, { status: 400 });
    }
    if (!resolved) {
      return NextResponse.json(
        { error: "Unsupported file type" },
        { status: 400 },
      );
    }
    if (owner.startsWith("websites/") && !WEBSITE_IMAGE_MIMES.has(resolved.mime)) {
      return NextResponse.json(
        { error: "Website uploads must be JPEG, PNG, WebP, or GIF" },
        { status: 400 },
      );
    }
    if (typeof body.size === "number" && body.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "File must be 100MB or smaller" },
        { status: 400 },
      );
    }

    const path = `${owner}/${crypto.randomUUID()}.${resolved.ext}`;
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.storage
      .from("blog-media")
      .createSignedUploadUrl(path);

    if (error || !data) {
      console.error("[admin/uploads] sign:", error?.message);
      return NextResponse.json(
        { error: "Failed to prepare upload" },
        { status: 500 },
      );
    }

    const { data: publicData } = supabase.storage
      .from("blog-media")
      .getPublicUrl(path);

    return NextResponse.json({
      path,
      token: data.token,
      signedUrl: data.signedUrl,
      url: publicData.publicUrl,
      contentType: resolved.mime,
    });
  }

  const form = await request.formData();
  const file = form.get("file");
  const owner = sanitizeOwner(
    String(form.get("owner") || form.get("postId") || ""),
  );

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }
  if (!owner) {
    return NextResponse.json({ error: "Missing upload owner" }, { status: 400 });
  }
  const resolved = resolveType(file.type, file.name);
  if (!resolved) {
    return NextResponse.json(
      { error: "Unsupported file type" },
      { status: 400 },
    );
  }
  if (owner.startsWith("websites/") && !WEBSITE_IMAGE_MIMES.has(resolved.mime)) {
    return NextResponse.json(
      { error: "Website uploads must be JPEG, PNG, WebP, or GIF" },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "File must be 100MB or smaller" },
      { status: 400 },
    );
  }

  const path = `${owner}/${crypto.randomUUID()}.${resolved.ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage
    .from("blog-media")
    .upload(path, buffer, {
      contentType: resolved.mime,
      cacheControl: "31536000",
      upsert: false,
    });

  if (error) {
    console.error("[admin/uploads]", error.message);
    return NextResponse.json(
      { error: "Failed to store file" },
      { status: 500 },
    );
  }

  const { data } = supabase.storage.from("blog-media").getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
