import { HeartHandshake, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { api, type ParentChildMission } from "../lib/api/client";
import { useAppStore } from "../store";

export function MissionsPage() {
  const bootstrap = useAppStore((state) => state.bootstrap);
  const [missions, setMissions] = useState<ParentChildMission[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void bootstrap().then(() => api.missions.list()).then(setMissions);
  }, [bootstrap]);

  return (
    <div className="space-y-6">
      <section className="page-hero">
        <p className="eyebrow">Together in the real world</p>
        <h1 className="mt-2 text-4xl font-black text-text-primary">Parent missions</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">These missions create meaningful moments with a parent. The reward unlocks only after parent validation.</p>
      </section>
      {error ? <div className="rounded-2xl bg-danger-bg p-4 text-sm font-bold text-danger">{error}</div> : null}
      <section className="grid gap-4 lg:grid-cols-2">
        {missions.length === 0 ? (
          <div className="panel p-6 text-sm text-text-secondary">No parent mission is available yet.</div>
        ) : missions.map((mission) => (
          <article key={mission.id} className="panel p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="pill"><HeartHandshake className="size-4" />With {mission.parent_name}</span>
              <span className="pill"><Sparkles className="size-4" />+{mission.xp_reward} XP</span>
            </div>
            <h2 className="mt-4 text-xl font-black text-text-primary">{mission.title}</h2>
            <p className="mt-2 text-sm leading-6 text-text-secondary">{mission.description}</p>
            <div className={`mt-5 rounded-cozy-md border-2 p-4 text-sm font-bold ${mission.status === "completed" ? "border-border bg-cream-secondary text-text-secondary" : "border-border bg-cream-secondary text-text-secondary"}`}>
              <ShieldCheck className="mr-2 inline size-4" />
              {mission.status === "completed" ? "Validated together" : mission.status === "child_submitted" ? "Sent to parent for validation" : "Complete it, then submit it to your parent"}
            </div>
            {mission.status === "pending" ? <button className="button-primary mt-4" onClick={async () => { try { await api.missions.submit(mission.id); setMissions(await api.missions.list()); } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to submit mission."); } }}>I did this mission</button> : null}
          </article>
        ))}
      </section>
    </div>
  );
}
