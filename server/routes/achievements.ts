import { Router } from "express";
import { authenticatedUser, requireAuth, requireChild } from "../middleware/auth";
import { achievementSummary } from "../services/achievements";

export const achievementsRouter = Router();
achievementsRouter.use(requireAuth);
achievementsRouter.use(requireChild);

achievementsRouter.get("/", async (_request, response) => {
  const user = authenticatedUser(response.locals);
  response.json(await achievementSummary(user.id));
});
