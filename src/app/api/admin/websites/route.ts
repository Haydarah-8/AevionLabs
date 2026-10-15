import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { listProjects } from "@/features/website-factory/services/store";
import {
  factoryPersistence,
  resetFactoryPersistenceCache,
} from "@/features/website-factory/services/persistence";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    // Re-probe after migrations may have been applied mid-session
    resetFactoryPersistenceCache();
    const [projects, persistence] = await Promise.all([
      listProjects(),
      factoryPersistence(),
    ]);
    return NextResponse.json({ projects, persistence });
  } catch (err) {
    console.error("[admin/websites]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load websites" },
      { status: 500 },
    );
  }
}
