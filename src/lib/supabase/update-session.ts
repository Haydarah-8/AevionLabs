import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

/** Refresh the Auth cookies. Authorization still happens in route handlers. */
export async function updateSession(request: NextRequest) {
  try {
    const env = getSupabasePublicEnv();
    if (!env) return NextResponse.next({ request });

    let response = NextResponse.next({ request });
    const { url, key } = env;

    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
          Object.entries(headers).forEach(([header, value]) => {
            response.headers.set(header, value);
          });
        },
      },
    });

    await supabase.auth.getUser();
    return response;
  } catch (err) {
    console.error("[proxy] session refresh failed:", err);
    return NextResponse.next({ request });
  }
}
