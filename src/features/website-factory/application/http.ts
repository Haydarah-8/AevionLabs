/**
 * Consistent API v1 response helpers.
 */

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "CONFLICT"
  | "DEPLOYMENT_FAILED"
  | "EXPORT_FAILED"
  | "SCRAPE_FAILED"
  | "INTEGRATION_ERROR"
  | "INTERNAL_ERROR";

export function apiOk<T>(data: T, meta: Record<string, unknown> = {}, init?: ResponseInit) {
  return Response.json({ data, meta }, init);
}

export function apiError(
  code: ApiErrorCode,
  message: string,
  details: unknown[] = [],
  status = 400,
) {
  return Response.json(
    {
      error: {
        code,
        message,
        details,
      },
    },
    { status },
  );
}

export function statusForCode(code: ApiErrorCode) {
  switch (code) {
    case "UNAUTHORIZED":
      return 401;
    case "FORBIDDEN":
      return 403;
    case "NOT_FOUND":
      return 404;
    case "RATE_LIMITED":
      return 429;
    case "CONFLICT":
      return 409;
    case "INTERNAL_ERROR":
      return 500;
    default:
      return 400;
  }
}
