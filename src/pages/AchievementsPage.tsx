import { Award, Flame, LockKeyhole, Sparkles, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api, type Achievement } from "../lib/api/client";
import { useAppStore } from "../store";

export function AchievementsPage() {
  const bootstrap = useAppStore((state) => state.bootstrap);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void bootstrap().then(() => api.achievements.list()).then(setAchievements).finally(() => setLoading(false));
  }, [bootstrap]);

  const unlocked = useMemo(() => achievements.filter((item) => Boolean(item.unlocked)), [achievements]);

  return (
    <div className="space-y-6">
      <section className="page-hero">
        <p className="eyebrow">Unlocks and rewards</p>
        <h1 className="mt-2 text-4xl font-black text-text-primary">Marketplace</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">Real actions unlock lasting rewards, badges, and parent-backed signs of progress. Nothing here is about grinding, only about celebrating what was actually done.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <span className="pill"><Award className="size-4" />{unlocked.length} unlocked</span>
          <span className="pill"><Star className="size-4" />{achievements.length - unlocked.length} waiting</span>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading ? <div className="panel p-5 text-sm text-text-secondary">Loading rewards...</div> : achievements.map((achievement) => {
          const isUnlocked = Boolean(achievement.unlocked);
          return (
            <article key={achievement.id} className={`panel p-5 ${isUnlocked ? "" : "opacity-70"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className={`grid size-12 place-items-center rounded-2xl ${isUnlocked ? "bg-cream-secondary text-text-secondary" : "bg-cream-secondary text-text-secondary"}`}>
                  {isUnlocked ? <Sparkles className="size-6" /> : <LockKeyhole className="size-5" />}
                </div>
                <span className="pill"><Flame className="size-4" />+{achievement.xp_reward} XP</span>
              </div>
              <h2 className="mt-4 text-lg font-black text-text-primary">{achievement.name}</h2>
              <p className="mt-2 text-sm leading-6 text-text-secondary">{achievement.description}</p>
              <p className="mt-4 text-xs font-extrabold uppercase tracking-wider text-text-muted">{isUnlocked ? `Unlocked ${new Date(achievement.unlocked_at ?? "").toLocaleDateString()}` : "Still waiting"}</p>
            </article>
          );
        })}
      </section>
    </div>
  );
}
