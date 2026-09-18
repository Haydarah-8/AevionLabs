import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requireSupabasePublicEnv } from "@/lib/supabase/env";

export async function createServerSupabase() {
  const { url, key } = requireSupabasePublicEnv();
  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot write cookies; proxy.ts refreshes the session.
        }
      },
    },
  });
}

export async function createRouteSupabase() {
  const { url, key } = requireSupabasePublicEnv();
  const cookieStore = await cookies();
  const pending: {
    name: string;
    value: string;
    options?: Parameters<NextResponse["cookies"]["set"]>[2];
  }[] = [];

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          pending.push({ name, value, options });
          try {
            cookieStore.set(name, value, options);
          } catch {
            /* response cookies are applied below */
          }
        });
      },
    },
  });

  function json(body: unknown, init?: { status?: number }) {
    const response = NextResponse.json(body, init);
    pending.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options);
    });
    return response;
  }

  return { supabase, json };
}
