import { Router } from "express";
import { authenticatedUser, requireAuth, requireChild } from "../middleware/auth";
import { getVillageState } from "../services/village";

export const villageRouter = Router();
villageRouter.use(requireAuth);
villageRouter.use(requireChild);

villageRouter.get("/state", (_request, response) => {
  const user = authenticatedUser(response.locals);
  response.json(getVillageState(user.id));
});
