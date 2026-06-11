import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "./database";
import { runMigrations } from "./migrate";

const currentDir = dirname(fileURLToPath(import.meta.url));
const schema = readFileSync(join(currentDir, "schema.sql"), "utf8");
db.exec(schema);
runMigrations();
console.log("LifeQuest database initialized.");
