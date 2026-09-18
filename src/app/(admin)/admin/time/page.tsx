import { redirect } from "next/navigation";

/** Merged into /admin?tab=time */
export default function AdminTimeRedirect() {
  redirect("/admin?tab=time");
}
