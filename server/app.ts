import cors from "cors";
import express from "express";
import { errorHandler } from "./middleware/errorHandler";
import { authRouter } from "./routes/auth";
import { achievementsRouter } from "./routes/achievements";
import { dashboardRouter } from "./routes/dashboard";
import { habitsRouter } from "./routes/habits";
import { goalsRouter } from "./routes/goals";
import { projectsRouter } from "./routes/projects";
import { missionsRouter } from "./routes/missions";
import { parentRouter } from "./routes/parent";
import { questsRouter } from "./routes/quests";
import { reviewsRouter } from "./routes/reviews";
import { villageRouter } from "./routes/village";
import { discoveryRouter } from "./routes/discovery";
import { focusRouter } from "./routes/focus";
import { lifeAreasRouter } from "./routes/lifeAreas";
import { campaignsRouter } from "./routes/campaigns";
import { insightsRouter } from "./routes/insights";
import { preferencesRouter } from "./routes/preferences";
import { notificationsRouter } from "./routes/notifications";
import { observeRequests } from "./middleware/observability";
import { databaseRuntime, store } from "./db/store";

export function createApp() {
  const app = express();
  app.set("trust proxy", 1);
  const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  app.disable("x-powered-by");
  app.use(cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }));
  app.use(express.json({ limit: "256kb" }));
  app.use(observeRequests);
  app.use((_request, response, next) => {
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("Referrer-Policy", "no-referrer");
    response.setHeader("X-Frame-Options", "DENY");
    next();
  });
  app.get("/api/health", async (_request, response) => {
    if (databaseRuntime === "unconfigured") {
      return response.status(503).json({
        status: "error",
        service: "lifequest-api",
        database: "unconfigured",
        error: "DATABASE_URL is missing from this Vercel deployment.",
      });
    }
    await store.get("SELECT 1 AS ready");
    return response.json({ status: "ok", service: "lifequest-api", database: databaseRuntime });
  });
  app.use("/api/auth", authRouter);
  app.use("/api/achievements", achievementsRouter);
  app.use("/api/goals", goalsRouter);
  app.use("/api/habits", habitsRouter);
  app.use("/api/projects", projectsRouter);
  app.use("/api/missions", missionsRouter);
  app.use("/api/parent", parentRouter);
  app.use("/api/quests", questsRouter);
  app.use("/api/reviews", reviewsRouter);
  app.use("/api/dashboard", dashboardRouter);
  app.use("/api/village", villageRouter);
  app.use("/api/discovery", discoveryRouter);
  app.use("/api/focus", focusRouter);
  app.use("/api/life-areas", lifeAreasRouter);
  app.use("/api/campaigns", campaignsRouter);
  app.use("/api/insights", insightsRouter);
  app.use("/api/preferences", preferencesRouter);
  app.use("/api/notifications", notificationsRouter);
  app.use("/api", (_request, response) => response.status(404).json({ error: "API route not found." }));
  app.use(errorHandler);
  return app;
}
