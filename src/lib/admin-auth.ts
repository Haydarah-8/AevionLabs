import type { User } from "@supabase/supabase-js";
import { createServerSupabase } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export function isAdminUser(
  user: Pick<User, "app_metadata"> | null | undefined,
): boolean {
  const role = user?.app_metadata?.role;
  return role === "admin" || role === "super_admin";
}

async function isListedAdmin(userId: string): Promise<boolean> {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("admin_users")
      .select("id")
      .eq("id", userId)
      .maybeSingle();
    if (error) {
      if (error.code !== "PGRST205") {
        console.error("[admin-auth] admin_users lookup:", error.message);
      }
      return false;
    }
    return Boolean(data?.id);
  } catch (err) {
    console.error("[admin-auth] admin_users lookup failed:", err);
    return false;
  }
}

export async function getAdminUser() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  if (isAdminUser(user) || (await isListedAdmin(user.id))) return user;
  return null;
}

export async function isAdminRequest(_request?: Request): Promise<boolean> {
  return (await getAdminUser()) !== null;
}
