import { ChevronRight, Target } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { api } from "../lib/api/client";
import { useAppStore } from "../store";
import { VillageMascot } from "../components/VillageMascot";

export function GoalsPage() {
  const bootstrap = useAppStore((state) => state.bootstrap);
  const [goals, setGoals] = useState<Array<{ id: number; title: string; category: string; status: string; progress: number }>>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Scolaire");
const [description, setDescription] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void bootstrap();
    void api.goals.list().then(setGoals);
  }, [bootstrap]);

  const activeGoals = useMemo(() => goals.filter((goal) => goal.status !== "completed" && goal.status !== "paused").length, [goals]);
  const visibleGoals = useMemo(() => goals.filter((goal) => filter === "all" || (filter === "completed" ? goal.status === "completed" : goal.status !== "completed" && goal.status !== "paused")), [filter, goals]);

  return (
    <div className="cozy-page">
      <section className="page-hero space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="pill"><Target className="size-4 text-[#6faf5c]" />Goals</span>
          <span className="pill">{goals.length} total</span>
          <span className="pill">{activeGoals} active</span>
        </div>
        <div>
          <p className="eyebrow">Outcome system</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-[#5a4632]">Goals</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7a6652]">Create clear outcomes, connect milestones and keep the direction visible without losing the cozy tone.</p>
        </div>
      </section>
      {error ? <div className="rounded-2xl bg-[#ffe0da] p-4 text-sm font-bold text-[#7a2626]">{error}</div> : null}
      <div className="flex gap-2">{(["all", "active", "completed"] as const).map((item) => <button key={item} className={filter === item ? "button-primary" : "button-secondary"} onClick={() => setFilter(item)}>{item}</button>)}</div>

      {visibleGoals.length === 0 ? (
        <EmptyState icon={Target} title="No goals yet" description="Create the first outcome you want to move." action="Create goal" />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {visibleGoals.map((goal) => (
            <article key={goal.id} className="panel p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">{goal.category}</p>
                  <h2 className="mt-1 text-xl font-black text-[#5a4632]">{goal.title}</h2>
                </div>
                <span className="pill">{goal.progress}%</span>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#eadfc8]">
                <div className="h-full rounded-full bg-[#6faf5c]" style={{ width: `${goal.progress}%` }} />
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-[#7a6652]">
                <span className="font-bold capitalize">{goal.status.replaceAll("_", " ")}</span>
                <Link to={`/goals/${goal.id}`} className="button-secondary text-xs"><ChevronRight className="size-4" />Open</Link>
              </div>
            </article>
          ))}
        </div>
      )}

      <section className="panel p-5">
        <h2 className="text-lg font-black text-[#5a4632]">Create goal</h2>
        <form className="mt-4 grid gap-3 md:grid-cols-3" onSubmit={async (e) => {
          e.preventDefault();
          try { await api.goals.create({ title, category, description, status: "in_progress" }); setTitle(""); setDescription(""); setGoals(await api.goals.list()); } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to create goal."); }
        }}>
          <input className="input md:col-span-1" placeholder="Goal title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <select className="input md:col-span-1" value={category} onChange={(e) => setCategory(e.target.value)}>{["Scolaire","Lecture","Sport","Arts","Découverte","Habitudes","Projet personnel","Famille"].map((item) => <option key={item}>{item}</option>)}</select>
          <input className="input md:col-span-3" placeholder="Short description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <button className="button-primary md:col-start-1 md:w-fit" type="submit">Save goal</button>
        </form>
      </section>
      <VillageMascot type="fox" message="Big dreams grow from clear little steps." />
    </div>
  );
}
