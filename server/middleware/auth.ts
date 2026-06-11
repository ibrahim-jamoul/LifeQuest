import type { RequestHandler } from "express";
import { getBearerToken, getSessionUser } from "../services/auth";
import type { AuthUser } from "../types/auth";

export const requireAuth: RequestHandler = (request, response, next) => {
  const token = getBearerToken(request.header("authorization"));
  const user = token ? getSessionUser(token) : null;
  if (!user) {
    response.status(401).json({ error: "Authentication required." });
    return;
  }
  response.locals.user = user;
  response.locals.token = token;
  next();
};

export const requireChild: RequestHandler = (_request, response, next) => {
  const user = response.locals.user as AuthUser | undefined;
  if (!user || user.role !== "child") {
    response.status(403).json({ error: "A child account is required." });
    return;
  }
  next();
};

export const requireParent: RequestHandler = (_request, response, next) => {
  const user = response.locals.user as AuthUser | undefined;
  if (!user || user.role !== "parent") {
    response.status(403).json({ error: "A parent account is required." });
    return;
  }
  next();
};

export function authenticatedUser(locals: Record<string, unknown>): AuthUser {
  return locals.user as AuthUser;
}
