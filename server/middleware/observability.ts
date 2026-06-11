import { randomUUID } from "node:crypto";
import type { RequestHandler } from "express";

export const observeRequests: RequestHandler = (request, response, next) => {
  const requestId = request.header("x-request-id") ?? randomUUID();
  const startedAt = performance.now();
  response.locals.requestId = requestId;
  response.setHeader("X-Request-Id", requestId);
  response.on("finish", () => {
    console.log(JSON.stringify({
      type: "http_request",
      requestId,
      method: request.method,
      path: request.path,
      status: response.statusCode,
      durationMs: Math.round(performance.now() - startedAt),
    }));
  });
  next();
};
