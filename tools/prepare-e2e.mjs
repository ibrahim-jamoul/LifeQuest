import { rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

const databasePath = resolve("./data/e2e.db");
for (const suffix of ["", "-shm", "-wal"]) rmSync(`${databasePath}${suffix}`, { force: true });

const env = { ...process.env, DATABASE_PATH: databasePath };
execFileSync(process.execPath, ["--import", "tsx", "server/db/init.ts"], { env, stdio: "inherit" });
execFileSync(process.execPath, ["--import", "tsx", "server/db/seed.ts"], { env, stdio: "inherit" });
