import { CheckSquare, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "../components/EmptyState";
import { StatCard } from "../components/StatCard";
import { useAppStore } from "../store";
import { api } from "../lib/api/client";

const priorities = ["low", "medium", "high", "critical"] as const;

export function QuestsPage() {
  const bootstrap = useAppStore((state) => state.bootstrap);
  const quests = useAppStore((state) => state.quests);
  const loading = useAppStore((state) => state.loading);
  const error = useAppStore((state) => state.error);
  const createQuest = useAppStore((state) => state.createQuest);
  const completeQuest = useAppStore((state) => state.completeQuest);
  const removeQuest = useAppStore((state) => state.removeQuest);
  const refreshCollections = useAppStore((state) => state.refreshCollections);
  const flashMessage = useAppStore((state) => state.flashMessage);
  const clearFlashMessage = useAppStore((state) => state.clearFlashMessage);

  const [filter, setFilter] = useState<"today" | "active" | "completed" | "all">("all");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<(typeof priorities)[number]>("medium");
  const [dueDate, setDueDate] = useState("");
  const [goalId, setGoalId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [goals, setGoals] = useState<Array<{ id: number; title: string }>>([]);
  const [projects, setProjects] = useState<Array<{ id: number; title: string }>>([]);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    void refreshCollections();
    void Promise.all([api.goals.list(), api.projects.list()]).then(([goalList, projectList]) => { setGoals(goalList); setProjects(projectList); });
  }, [refreshCollections]);

  const visibleQuests = useMemo(() => {
    if (filter === "all") return quests;
    if (filter === "today") return quests.filter((quest) => quest.due_date === new Date().toISOString().slice(0, 10));
    if (filter === "completed") return quests.filter((quest) => Boolean(quest.is_completed));
    return quests.filter((quest) => !quest.is_completed);
  }, [filter, quests]);

  const completedCount = quests.filter((quest) => Boolean(quest.is_completed)).length;

  return (
    <div className="space-y-6">
      {flashMessage ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">
          {flashMessage}
          <button className="ml-3 text-xs font-black uppercase tracking-wide text-emerald-700" onClick={clearFlashMessage}>Dismiss</button>
        </div>
      ) : null}
      {error ? <div className="rounded-2xl bg-[#ffe0da] p-4 text-sm font-bold text-[#7a2626]">{error}</div> : null}

      <header className="space-y-2">
        <p className="eyebrow">Daily execution</p>
        <h1 className="text-3xl font-black tracking-tight">Quests</h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-400">Create concrete daily actions linked to goals and projects. Keep the list short and executable.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Open quests" value={String(quests.length - completedCount)} meta="Active execution items" icon={CheckSquare} />
        <StatCard label="Completed" value={String(completedCount)} meta="Done so far" icon={CheckSquare} accent="text-emerald-400" />
        <StatCard label="Filter" value={filter.toUpperCase()} meta="Current view" icon={CheckSquare} accent="text-sky-400" />
        <StatCard label="Loading" value={loading ? "Yes" : "No"} meta="Bootstrap state" icon={CheckSquare} accent="text-violet-400" />
      </div>

      <section className="panel p-4 md:p-6">
        <h2 className="mb-4 text-lg font-bold">Create quest</h2>
        <form
          className="grid gap-3 md:grid-cols-2"
          onSubmit={async (event) => {
            event.preventDefault();
            await createQuest({
              title,
              description,
              priority,
              dueDate: dueDate || null,
              estimatedMinutes: null,
              goalId: goalId ? Number(goalId) : null,
              projectId: projectId ? Number(projectId) : null,
            });
            setTitle("");
            setDescription("");
            setDueDate("");
            setPriority("medium");
            setGoalId("");
            setProjectId("");
          }}
        >
          <input className="input" placeholder="Quest title" value={title} onChange={(event) => setTitle(event.target.value)} />
          <select className="input" value={priority} onChange={(event) => setPriority(event.target.value as (typeof priorities)[number])}>
            {priorities.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <input className="input md:col-span-2" placeholder="Description" value={description} onChange={(event) => setDescription(event.target.value)} />
          <input className="input" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
          <select className="input" value={goalId} onChange={(event) => setGoalId(event.target.value)}><option value="">No linked goal</option>{goals.map((goal) => <option key={goal.id} value={goal.id}>{goal.title}</option>)}</select>
          <select className="input" value={projectId} onChange={(event) => setProjectId(event.target.value)}><option value="">No linked project</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.title}</option>)}</select>
          <button className="button-primary justify-center md:justify-self-start" type="submit" disabled={loading}><Plus className="size-4" />{loading ? "Saving..." : "Add quest"}</button>
        </form>
      </section>

      <section className="panel p-4 md:p-6">
        <div className="mb-4 flex flex-wrap gap-2">
          {(["all", "today", "active", "completed"] as const).map((item) => (
            <button key={item} className={`rounded-full px-3 py-1.5 text-sm font-semibold ${filter === item ? "bg-mint text-slate-950" : "bg-slate-800 text-slate-300"}`} onClick={() => setFilter(item)}>
              {item}
            </button>
          ))}
        </div>

        {visibleQuests.length === 0 ? (
          <EmptyState icon={CheckSquare} title="No quests yet" description="Add the first daily action you want to execute today." action="Create first quest" />
        ) : (
          <div className="space-y-3">
            {visibleQuests.map((quest) => (
              <article key={quest.id} className="flex flex-col gap-3 rounded-2xl border border-line bg-panel/70 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                    <span>{quest.priority}</span>
                    <span>·</span>
                    <span>{quest.due_date ?? "no due date"}</span>
                    <span>·</span>
                    <span>{quest.xp_reward} XP</span>
                  </div>
                  <h3 className="mb-1 mt-2 text-base font-bold">{quest.title}</h3>
                  <p className="m-0 text-sm leading-6 text-slate-400">{quest.description || "No description"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="button-secondary" onClick={() => completeQuest(quest.id)} disabled={loading || Boolean(quest.is_completed)}>
                    {quest.is_completed ? "Completed" : "Complete"}
                  </button>
                  <button className="button-secondary" disabled={loading} onClick={() => removeQuest(quest.id)}><Trash2 className="size-4" /></button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
