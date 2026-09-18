import { NextResponse } from "next/server";
import { getAdminUser, isAdminRequest } from "@/lib/admin-auth";
import { exportToGithubPullRequest } from "@/features/website-factory/integrations/github";
import { factoryErrorMessage } from "@/features/website-factory/services/schemas";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const user = await getAdminUser();
    const body = z
      .object({
        owner: z.string().min(1),
        repo: z.string().min(1),
        branch: z.string().optional(),
      })
      .parse(await request.json());
    const result = await exportToGithubPullRequest({
      projectId: id,
      owner: body.owner,
      repo: body.repo,
      branch: body.branch,
      actorId: user?.id ?? null,
    });
    return NextResponse.json(result);
  } catch (err) {
    const message = factoryErrorMessage(err, "GitHub export failed");
    const status = /not connected|not configured|GITHUB_/i.test(message)
      ? 400
      : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
