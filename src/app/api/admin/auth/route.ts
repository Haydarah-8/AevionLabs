import { createRouteSupabase } from "@/lib/supabase/server";
import { getAdminUser, isAdminUser } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getAdminUser();
  return Response.json({
    authenticated: Boolean(user),
    email: user?.email ?? null,
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };
    const email = body.email?.trim() ?? "";
    const password = body.password ?? "";
    if (!email || !password) {
      return Response.json(
        { success: false, error: "Email and password are required." },
        { status: 400 },
      );
    }

    const { supabase, json } = await createRouteSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return json(
        { success: false, error: "Invalid credentials." },
        { status: 401 },
      );
    }

    const listed = await isListedAdmin(data.user.id);
    if (!isAdminUser(data.user) && !listed) {
      await supabase.auth.signOut();
      return json(
        {
          success: false,
          error: "This account is not authorized for the registry.",
        },
        { status: 403 },
      );
    }

    return json({ success: true });
  } catch (err) {
    console.error("[admin/auth] login:", err);
    return Response.json(
      { success: false, error: "Internal server error." },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  const { supabase, json } = await createRouteSupabase();
  await supabase.auth.signOut();
  return json({ success: true });
}

async function isListedAdmin(userId: string) {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("admin_users")
      .select("id")
      .eq("id", userId)
      .maybeSingle();
    if (error) {
      if (error.code !== "PGRST205") {
        console.error("[admin/auth] admin_users lookup:", error.message);
      }
      return false;
    }
    return Boolean(data?.id);
  } catch (err) {
    console.error("[admin/auth] admin_users lookup failed:", err);
    return false;
  }
}
