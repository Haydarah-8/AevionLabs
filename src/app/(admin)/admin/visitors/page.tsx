import { redirect } from "next/navigation";

/** Merged into /admin?tab=audit */
export default function AdminVisitorsRedirect() {
  redirect("/admin?tab=audit");
}
