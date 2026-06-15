import { CheckSquare, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "../components/EmptyState";
import { StatCard } from "../components/StatCard";
import { VillageMascot } from "../components/VillageMascot";
import { api, type Quest } from "../lib/api/client";
import { useAppStore } from "../store";

const priorities = ["low", "medium", "high", "critical"] as const;

export function QuestsPage() {
  const { bootstrap, quests, loading, error, createQuest, completeQuest, removeQuest, refreshCollections, flashMessage, clearFlashMessage } = useAppStore();
  const [filter, setFilter] = useState<"today" | "active" | "completed" | "all">("all");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Quest["priority"]>("medium");
  const [dueDate, setDueDate] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState("");
  const [goalId, setGoalId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [goals, setGoals] = useState<Array<{ id: number; title: string }>>([]);
  const [projects, setProjects] = useState<Array<{ id: number; title: string }>>([]);
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);

  useEffect(() => { void bootstrap(); }, [bootstrap]);
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

  return <div className="cozy-page">
    {flashMessage ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">{flashMessage}<button className="ml-3 text-xs font-black uppercase tracking-wide text-emerald-700" onClick={clearFlashMessage}>Dismiss</button></div> : null}
    {error ? <div className="rounded-2xl bg-[#ffe0da] p-4 text-sm font-bold text-[#7a2626]">{error}</div> : null}
    <header className="space-y-2"><p className="eyebrow">Daily execution</p><h1>Quests</h1><p className="cozy-subtitle">Create concrete daily actions linked to goals and projects. Keep the list short and executable.</p></header>
    <div className="grid gap-4 md:grid-cols-4">
      <StatCard label="Open quests" value={String(quests.length - completedCount)} meta="Active execution items" icon={CheckSquare} />
      <StatCard label="Completed" value={String(completedCount)} meta="Done so far" icon={CheckSquare} accent="text-emerald-400" />
      <StatCard label="Filter" value={filter.toUpperCase()} meta="Current view" icon={CheckSquare} accent="text-sky-400" />
      <StatCard label="Loading" value={loading ? "Yes" : "No"} meta="Bootstrap state" icon={CheckSquare} accent="text-violet-400" />
    </div>
    <section className="panel p-4 md:p-6"><h2 className="mb-4 text-lg font-bold">Create quest</h2>
      <form className="grid gap-3 md:grid-cols-2" onSubmit={async (event) => {
        event.preventDefault();
        await createQuest({ title, description, priority, dueDate: dueDate || null, estimatedMinutes: estimatedMinutes ? Number(estimatedMinutes) : null, goalId: goalId ? Number(goalId) : null, projectId: projectId ? Number(projectId) : null });
        setTitle(""); setDescription(""); setDueDate(""); setEstimatedMinutes(""); setPriority("medium"); setGoalId(""); setProjectId("");
      }}>
        <input className="input" placeholder="Quest title" value={title} onChange={(event) => setTitle(event.target.value)} required />
        <select className="input" value={priority} onChange={(event) => setPriority(event.target.value as Quest["priority"])}>{priorities.map((item) => <option key={item} value={item}>{item}</option>)}</select>
        <input className="input md:col-span-2" placeholder="Description" value={description} onChange={(event) => setDescription(event.target.value)} />
        <input className="input" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
        <input className="input" type="number" min="1" max="1440" placeholder="Estimated minutes" value={estimatedMinutes} onChange={(event) => setEstimatedMinutes(event.target.value)} />
        <select className="input" value={goalId} onChange={(event) => setGoalId(event.target.value)}><option value="">No linked goal</option>{goals.map((goal) => <option key={goal.id} value={goal.id}>{goal.title}</option>)}</select>
        <select className="input" value={projectId} onChange={(event) => setProjectId(event.target.value)}><option value="">No linked project</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.title}</option>)}</select>
        <button className="button-primary justify-center md:justify-self-start" type="submit" disabled={loading}><Plus className="size-4" />{loading ? "Saving..." : "Add quest"}</button>
      </form>
    </section>
    <section className="panel p-4 md:p-6">
      <div className="mb-4 flex flex-wrap gap-2">{(["all", "today", "active", "completed"] as const).map((item) => <button key={item} className={`filter-pill ${filter === item ? "filter-pill-active" : ""}`} onClick={() => setFilter(item)}>{item}</button>)}</div>
      {visibleQuests.length === 0 ? <EmptyState icon={CheckSquare} title="No quests yet" description="Add the first daily action you want to execute today." action="Create first quest" /> : <div className="space-y-3">{visibleQuests.map((quest) =>
        <article key={quest.id} className="cozy-item">
          {editingQuest?.id === quest.id ? <form className="grid gap-3 md:grid-cols-2" onSubmit={async (event) => {
            event.preventDefault();
            await api.quests.update(quest.id, { title: editingQuest.title, description: editingQuest.description, dueDate: editingQuest.due_date, priority: editingQuest.priority, estimatedMinutes: editingQuest.estimated_minutes, goalId: editingQuest.goal_id, projectId: editingQuest.project_id });
            setEditingQuest(null); await refreshCollections();
          }}>
            <input aria-label="Edit quest title" className="input" value={editingQuest.title} onChange={(event) => setEditingQuest({ ...editingQuest, title: event.target.value })} required />
            <select aria-label="Edit quest priority" className="input" value={editingQuest.priority} onChange={(event) => setEditingQuest({ ...editingQuest, priority: event.target.value as Quest["priority"] })}>{priorities.map((item) => <option key={item} value={item}>{item}</option>)}</select>
            <input aria-label="Edit quest description" className="input md:col-span-2" value={editingQuest.description} onChange={(event) => setEditingQuest({ ...editingQuest, description: event.target.value })} />
            <input aria-label="Edit quest due date" className="input" type="date" value={editingQuest.due_date ?? ""} onChange={(event) => setEditingQuest({ ...editingQuest, due_date: event.target.value || null })} />
            <input aria-label="Edit quest effort" className="input" type="number" min="1" max="1440" value={editingQuest.estimated_minutes ?? ""} onChange={(event) => setEditingQuest({ ...editingQuest, estimated_minutes: event.target.value ? Number(event.target.value) : null })} />
            <div className="flex gap-2 md:col-span-2"><button className="button-primary" type="submit"><Save className="size-4" />Save quest</button><button className="button-secondary" type="button" onClick={() => setEditingQuest(null)}><X className="size-4" />Cancel</button></div>
          </form> : <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div><div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#7a6a58]"><span className="pill">{quest.priority}</span><span>·</span><span>{quest.due_date ?? "no due date"}</span><span>·</span><span>{quest.estimated_minutes ? `${quest.estimated_minutes} min` : "effort unset"}</span><span className="font-extrabold text-[#f4a261]">+{quest.xp_reward} XP</span></div><h3 className="mb-1 mt-2 text-base font-bold">{quest.title}</h3><p className="m-0 text-sm leading-6 text-[#7a6a58]">{quest.description || "No description"}</p></div>
            <div className="flex items-center gap-2"><button aria-label={`Edit ${quest.title}`} className="button-secondary" onClick={() => setEditingQuest(quest)}><Pencil className="size-4" /></button><button className="button-secondary" onClick={() => completeQuest(quest.id)} disabled={loading || Boolean(quest.is_completed)}>{quest.is_completed ? "Completed" : "Complete"}</button><button aria-label={`Delete ${quest.title}`} className="button-secondary" disabled={loading} onClick={() => removeQuest(quest.id)}><Trash2 className="size-4" /></button></div>
          </div>}
        </article>)}</div>}
    </section>
    <VillageMascot type="squirrel" message="Small actions every day build a beautiful life." />
  </div>;
}
