import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError, ZodType } from "zod";

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: ErrorCode,
    message: string,
    public readonly fields?: Record<string, string>,
  ) {
    super(message);
  }
}

function fieldsFromZod(error: ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    if (issue.code === "unrecognized_keys") {
      for (const key of issue.keys) fields[key] ??= "Unknown field.";
      continue;
    }
    const key = issue.path.length ? issue.path.join(".") : "body";
    fields[key] ??= issue.message;
  }
  return fields;
}

export function validateBody<T>(schema: ZodType<T>): RequestHandler {
  return (req, _res, next) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return next(
        new ApiError(
          400,
          "VALIDATION_ERROR",
          "Check the submitted fields.",
          fieldsFromZod(parsed.error),
        ),
      );
    }
    req.body = parsed.data;
    return next();
  };
}

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ApiError) {
    return res.status(error.status).json({
      error: {
        code: error.code,
        message: error.message,
        ...(error.fields ? { fields: error.fields } : {}),
      },
    });
  }

  if (error instanceof SyntaxError && "body" in error) {
    return res.status(400).json({
      error: { code: "VALIDATION_ERROR", message: "Request body must be valid JSON." },
    });
  }

  if (process.env.NODE_ENV !== "test") {
    console.error("Unhandled server error");
  }
  return res.status(500).json({
    error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred." },
  });
};
