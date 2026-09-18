import { authenticateApiRequest } from "@/features/website-factory/developer/auth";
import { apiError } from "@/features/website-factory/application/http";
import { exportWebsiteZip } from "@/features/website-factory/application/deployment";
import { factoryErrorMessage } from "@/features/website-factory/services/schemas";
import { rateLimit } from "@/features/website-factory/application/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authenticateApiRequest(request, {
    requiredScope: "websites:read",
    limit: 20,
  });
  if (auth instanceof Response) return auth;

  const limited = rateLimit({
    key: `export:${auth.keyId || auth.actorId || "anon"}`,
    limit: 10,
    windowMs: 60_000,
  });
  if (!limited.ok) {
    return apiError("RATE_LIMITED", "Export rate limit exceeded", [], 429);
  }

  const { id } = await params;
  try {
    const { buffer, filename } = await exportWebsiteZip(id, auth.actorId);
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    return apiError(
      "EXPORT_FAILED",
      factoryErrorMessage(err, "Export failed"),
      [],
      500,
    );
  }
}
