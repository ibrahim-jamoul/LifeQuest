import { createApp } from "./app";
if (!process.env.DATABASE_URL) await import("./db/init");
const port = Number(process.env.PORT ?? 4000);
const app = createApp();
app.listen(port, () => console.log(`LifeQuest API listening on http://localhost:${port}`));
