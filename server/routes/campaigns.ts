import { Router } from "express";
import { z } from "zod";
import { db } from "../db/database";
import { authenticatedUser, requireAuth, requireChild } from "../middleware/auth";

const schema = z.object({ title: z.string().trim().min(1).max(160), schoolYear: z.string().trim().min(4).max(20), annualGoal: z.string().max(500).default("") });
const monthNames = ["September", "October", "November", "December", "January", "February", "March", "April", "May", "June", "July", "August"];
export const campaignsRouter = Router();
campaignsRouter.use(requireAuth, requireChild);
campaignsRouter.get("/", (_request, response) => {
  const user = authenticatedUser(response.locals);
  const campaign = db.prepare("SELECT * FROM school_campaigns WHERE user_id = ? ORDER BY id DESC LIMIT 1").get(user.id) as { id: number } | undefined;
  response.json({ campaign: campaign ?? null, chapters: campaign ? db.prepare("SELECT * FROM campaign_chapters WHERE campaign_id = ? ORDER BY month_number").all(campaign.id) : [] });
});
campaignsRouter.post("/", (request, response) => {
  const user = authenticatedUser(response.locals);
  const parsed = schema.safeParse(request.body);
  if (!parsed.success) return response.status(400).json({ error: parsed.error.flatten() });
  const result = db.prepare("INSERT INTO school_campaigns (user_id, title, school_year, annual_goal) VALUES (?, ?, ?, ?)").run(user.id, parsed.data.title, parsed.data.schoolYear, parsed.data.annualGoal);
  const id = Number(result.lastInsertRowid);
  const insert = db.prepare("INSERT INTO campaign_chapters (campaign_id, month_number, title, theme) VALUES (?, ?, ?, ?)");
  monthNames.forEach((month, index) => insert.run(id, index + 1, `Chapter ${index + 1}: ${month}`, index === 0 ? "New beginnings" : "Keep growing"));
  return response.status(201).json({ campaign: db.prepare("SELECT * FROM school_campaigns WHERE id = ?").get(id), chapters: db.prepare("SELECT * FROM campaign_chapters WHERE campaign_id = ?").all(id) });
});
campaignsRouter.patch("/chapters/:id", (request, response) => {
  const user = authenticatedUser(response.locals);
  const progress = z.object({ progress: z.number().int().min(0).max(100) }).safeParse(request.body);
  if (!progress.success) return response.status(400).json({ error: progress.error.flatten() });
  const result = db.prepare("UPDATE campaign_chapters SET progress = MAX(progress, ?), is_completed = CASE WHEN ? >= 100 THEN 1 ELSE is_completed END WHERE id = ? AND campaign_id IN (SELECT id FROM school_campaigns WHERE user_id = ?)").run(progress.data.progress, progress.data.progress, request.params.id, user.id);
  return result.changes ? response.json(db.prepare("SELECT * FROM campaign_chapters WHERE id = ?").get(request.params.id)) : response.status(404).json({ error: "Chapter not found." });
});
