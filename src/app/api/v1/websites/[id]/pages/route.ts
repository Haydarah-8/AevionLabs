import { authenticateApiRequest } from "@/features/website-factory/developer/auth";
import { apiError, apiOk } from "@/features/website-factory/application/http";
import {
  createWebsitePage,
  listWebsitePages,
} from "@/features/website-factory/application/page";
import { factoryErrorMessage } from "@/features/website-factory/services/schemas";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authenticateApiRequest(request, {
    requiredScope: "pages:read",
  });
  if (auth instanceof Response) return auth;
  const { id } = await params;
  try {
    const pages = await listWebsitePages(id);
    return apiOk(pages, { count: pages.length });
  } catch (err) {
    return apiError("NOT_FOUND", factoryErrorMessage(err, "Not found"), [], 404);
  }
}

const createSchema = z.object({
  title: z.string().min(1).max(160),
  slug: z.string().min(1).max(80).optional(),
  navLabel: z.string().max(80).optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authenticateApiRequest(request, {
    requiredScope: "pages:write",
  });
  if (auth instanceof Response) return auth;
  const { id } = await params;
  try {
    const body = createSchema.parse(await request.json());
    const page = await createWebsitePage(id, body, auth.actorId);
    return apiOk(page, {}, { status: 201 });
  } catch (err) {
    return apiError(
      "VALIDATION_ERROR",
      factoryErrorMessage(err, "Could not create page"),
    );
  }
}
