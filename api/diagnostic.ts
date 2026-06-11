import type { IncomingMessage, ServerResponse } from "node:http";

export default function handler(_request: IncomingMessage, response: ServerResponse) {
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify({
    status: "ok",
    runtime: "node",
    databaseConfigured: Boolean(process.env.DATABASE_URL),
  }));
}
