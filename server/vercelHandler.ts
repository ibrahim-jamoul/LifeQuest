import type { IncomingMessage, ServerResponse } from "node:http";
import { createApp } from "./app";

interface VercelRequest extends IncomingMessage {
  query?: Record<string, string | string[]>;
}

const app = createApp();

export default function handler(request: VercelRequest, response: ServerResponse) {
  const path = request.query?.path;
  const normalizedPath = Array.isArray(path) ? path.join("/") : path ?? "";
  request.url = `/api/${normalizedPath}`;
  return app(request, response);
}
