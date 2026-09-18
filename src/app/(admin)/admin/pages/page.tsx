import { redirect } from "next/navigation";

/** Removed from nav — CMS pages live under site settings / Insights. */
export default function AdminPagesRedirect() {
  redirect("/admin");
}
