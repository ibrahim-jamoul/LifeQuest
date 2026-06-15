import { CheckCircle2, Flame, HeartHandshake, Plus, RotateCcw, ShieldCheck, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, type ParentChildMission, type ParentChildSummary } from "../lib/api/client";
import { useAppStore } from "../store";

export function ParentPage() {
  const navigate = useNavigate();
  const returnToChild = useAppStore((state) => state.returnToChild);
  const [children, setChildren] = useState<ParentChildSummary[]>([]);
  const [missions, setMissions] = useState<ParentChildMission[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const [dashboard, missionList] = await Promise.all([api.parent.dashboard(), api.missions.list()]);
      setChildren(dashboard.children);
      setMissions(missionList);
      setError(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load the parent lodge.");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const child = children[0];

  return (
    <div className="space-y-6">
      <section className="page-hero">
        <p className="eyebrow">Support without micromanaging</p>
        <h1 className="mt-2 text-4xl font-black text-text-primary">Parent lodge</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">Follow progress, create shared missions, and validate real moments completed together.</p>
      </section>

      <button className="button-secondary md:w-fit" onClick={async () => { await returnToChild(); navigate("/", { replace: true }); }}><RotateCcw className="size-4" />Return to child account</button>
      {error ? <section className="rounded-2xl border-2 border-border bg-danger-bg p-4 text-sm font-bold text-danger">{error}</section> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="panel p-5"><p className="eyebrow">Child</p><strong className="mt-2 block text-2xl text-text-primary">{child?.display_name ?? "No linked child"}</strong><p className="mt-1 text-sm text-text-secondary">{child ? `${child.grade} · Level ${child.level}` : "Link required"}</p></div>
        <div className="panel p-5"><p className="eyebrow">XP</p><strong className="mt-2 block text-2xl text-text-primary">{child?.total_xp ?? 0}</strong><Flame className="mt-2 size-5 text-accent" /></div>
        <div className="panel p-5"><p className="eyebrow">Completed quests</p><strong className="mt-2 block text-2xl text-text-primary">{child?.completedQuests ?? 0}</strong><CheckCircle2 className="mt-2 size-5 text-primary" /></div>
        <div className="panel p-5"><p className="eyebrow">Pending together</p><strong className="mt-2 block text-2xl text-text-primary">{child?.pendingMissions ?? 0}</strong><HeartHandshake className="mt-2 size-5 text-text-secondary" /></div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
        <form className="panel p-5" onSubmit={async (event) => {
          event.preventDefault();
          if (!child) return;
          setSaving(true);
          try {
            await api.missions.create({ childId: child.id, title, description });
            setTitle("");
            setDescription("");
            await load();
          } finally {
            setSaving(false);
          }
        }}>
          <h2 className="text-lg font-black text-text-primary">Create a shared mission</h2>
          <div className="mt-4 space-y-3">
            <input className="input" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Mission title" required />
            <textarea className="input" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What will you do together?" rows={5} />
            <button className="button-primary" type="submit" disabled={saving || !child}><Plus className="size-4" />{saving ? "Creating..." : "Create mission"}</button>
          </div>
        </form>
        <div className="panel p-5">
          <h2 className="text-lg font-black text-text-primary">Missions to validate</h2>
          <div className="mt-4 space-y-3">
            {missions.length === 0 ? <p className="text-sm text-text-secondary">No mission yet.</p> : missions.map((mission) => (
              <article key={mission.id} className="rounded-cozy-lg border-2 border-border bg-cream-light p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div><h3 className="font-black text-text-primary">{mission.title}</h3><p className="mt-1 text-sm text-text-secondary">{mission.description}</p></div>
                  {mission.status === "child_submitted" ? <button className="button-primary md:w-fit" onClick={async () => { await api.missions.validate(mission.id); await load(); }}><ShieldCheck className="size-4" />Validate</button> : <span className="pill"><Target className="size-4" />{mission.status === "pending" ? "Waiting for child" : "Completed"}</span>}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
