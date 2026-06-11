import type { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  const requestId = response.locals.requestId as string | undefined;
  console.error(JSON.stringify({ type: "api_error", requestId, message: error instanceof Error ? error.message : String(error) }));
  response.status(500).json({ error: "An unexpected error occurred.", requestId });
};
