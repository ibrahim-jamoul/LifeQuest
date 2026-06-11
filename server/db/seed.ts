import "./init";
import { db } from "./database";
import { hashPassword } from "../services/auth";

const CHILD_EMAIL = "child@lifequest.local";
const PARENT_EMAIL = "parent@lifequest.local";
const DEMO_PASSWORD = "lifequest123";

function ensureUser(email: string, displayName: string): number {
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email) as { id: number } | undefined;
  if (existing) return existing.id;
  return Number(db.prepare("INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)").run(email, hashPassword(DEMO_PASSWORD), displayName).lastInsertRowid);
}

function localDate(offsetDays = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

db.exec("BEGIN IMMEDIATE");
try {
  const parentId = ensureUser(PARENT_EMAIL, "Parent LifeQuest");
  const childId = ensureUser(CHILD_EMAIL, "Alex");

  db.prepare("INSERT OR IGNORE INTO parent_profiles (user_id) VALUES (?)").run(parentId);
  db.prepare("INSERT OR IGNORE INTO child_profiles (user_id, age, grade, age_group, parent_id) VALUES (?, 10, 'CM2', '10-12', ?)").run(childId, parentId);

  const habits = [
    ["Prepare my school bag", "Get ready calmly for tomorrow.", "daily", "Home"],
    ["Read for 20 minutes", "Choose any book and read attentively.", "daily", "Learning"],
    ["Move my body", "Play, walk, stretch, or practice a sport.", "daily", "Health"],
    ["Help at home", "Complete one useful action for the family.", "daily", "Home"],
    ["Practice something difficult", "Spend focused time improving a skill.", "weekly", "Learning"],
  ] as const;
  if ((db.prepare("SELECT COUNT(*) AS count FROM habits WHERE user_id = ?").get(childId) as { count: number }).count === 0) {
    const insertHabit = db.prepare("INSERT INTO habits (user_id, name, description, frequency, category, xp_reward) VALUES (?, ?, ?, ?, ?, 5)");
    for (const habit of habits) insertHabit.run(childId, ...habit);
  }

  const quests = [
    ["Finish today's homework", "Complete the school work planned for today.", localDate(), "high", 30],
    ["Tidy my learning space", "Make the desk ready for focused work.", localDate(), "medium", 10],
    ["Ask one curious question", "Ask a parent or teacher about something interesting.", localDate(), "low", 10],
    ["Choose this week's mini-project", "Pick one useful thing to create or explore.", localDate(1), "medium", 20],
    ["Prepare a parent-child reading moment", "Choose a book to read together.", localDate(1), "medium", 20],
  ] as const;
  if ((db.prepare("SELECT COUNT(*) AS count FROM tasks WHERE user_id = ?").get(childId) as { count: number }).count === 0) {
    const insertQuest = db.prepare("INSERT INTO tasks (user_id, title, description, due_date, priority, estimated_minutes, xp_reward) VALUES (?, ?, ?, ?, ?, ?, 10)");
    for (const quest of quests) insertQuest.run(childId, ...quest);
  }

  const domains = [
    ["Science & Nature", "leaf", "Explore living things, experiments, and the natural world.", "all"],
    ["Arts & Creativity", "palette", "Create, imagine, draw, build, and express ideas.", "all"],
    ["Technology & Code", "code", "Understand how digital tools work and build simple creations.", "10-12"],
  ] as const;
  const insertDomain = db.prepare("INSERT OR IGNORE INTO discovery_domains (name, icon, description, age_group) VALUES (?, ?, ?, ?)");
  for (const domain of domains) insertDomain.run(...domain);
  const challengeSeed = [
    ["Science & Nature", "Observe a tiny ecosystem", "Spend 15 minutes outside and write down three living things.", 30, "all"],
    ["Arts & Creativity", "Create with recycled materials", "Build a useful or beautiful object from something reusable.", 30, "all"],
    ["Technology & Code", "Explain an algorithm", "Write clear steps that another person could follow.", 30, "10-12"],
  ] as const;
  const insertChallenge = db.prepare("INSERT INTO discovery_challenges (domain_id, title, description, xp_reward, age_group) SELECT id, ?, ?, ?, ? FROM discovery_domains WHERE name = ? AND NOT EXISTS (SELECT 1 FROM discovery_challenges WHERE title = ?)");
  for (const [domain, title, description, xp, ageGroup] of challengeSeed) insertChallenge.run(title, description, xp, ageGroup, domain, title);

  const areaNames = ["Learning", "Creativity", "Health", "Family", "Confidence", "Discipline"];
  const insertArea = db.prepare("INSERT OR IGNORE INTO life_areas (user_id, name, score, trend) VALUES (?, ?, 50, 'stable')");
  for (const name of areaNames) insertArea.run(childId, name);
  db.prepare("INSERT OR IGNORE INTO user_preferences (user_id) VALUES (?)").run(childId);

  db.prepare(`
    INSERT INTO parent_child_missions (child_id, parent_id, title, description)
    SELECT ?, ?, ?, ?
    WHERE NOT EXISTS (SELECT 1 FROM parent_child_missions WHERE child_id = ? AND status = 'pending')
  `).run(childId, parentId, "Read together for 20 minutes", "Choose a book, read together, then share one thing you each learned.", childId);

  const insertZone = db.prepare("INSERT OR IGNORE INTO village_state (user_id, zone_id, unlocked) VALUES (?, ?, 1)");
  for (const zone of ["home", "garden", "learning", "workshop", "town-hall", "lighthouse", "pathways", "discovery"]) insertZone.run(childId, zone);

  db.exec("COMMIT");
  console.log(`Seed complete. Child: ${CHILD_EMAIL}, Parent: ${PARENT_EMAIL}, Password: ${DEMO_PASSWORD}`);
} catch (error) {
  db.exec("ROLLBACK");
  throw error;
}
