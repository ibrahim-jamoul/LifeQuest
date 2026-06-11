import { Flag, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { api, type FocusPriority, type WeeklyChallenge } from "../lib/api/client";
import { useAppStore } from "../store";

export function FocusPage() {
  const [priorities, setPriorities] = useState<FocusPriority[]>([]);
  const [goals, setGoals] = useState<Array<{ id: number; title: string; status: string }>>([]);
  const [projects, setProjects] = useState<Array<{ id: number; title: string; status: string }>>([]);
  const [selected, setSelected] = useState("");
  const [kind, setKind] = useState<"main" | "secondary">("main");
  const [error, setError] = useState<string | null>(null);
  const [challenges, setChallenges] = useState<WeeklyChallenge[]>([]);
  const [challengeTitle, setChallengeTitle] = useState("");
  const load = async () => { const [focus, goalList, projectList] = await Promise.all([api.focus.get(), api.goals.list(), api.projects.list()]); setPriorities(focus.priorities); setChallenges(focus.challenges); setGoals(goalList); setProjects(projectList); };
  useEffect(() => { void load(); }, []);
  const main = priorities.filter((item) => item.priority_type === "main").length;
  const secondary = priorities.filter((item) => item.priority_type === "secondary").length;
  const activeGoals = goals.filter((goal) => goal.status !== "completed" && goal.status !== "paused").length;
  const activeProjects = projects.filter((project) => project.status !== "completed" && project.status !== "paused").length;
  const spreadRisk = activeGoals + activeProjects > 8 ? "high" : activeGoals + activeProjects > 5 ? "medium" : "low";
  return <div className="space-y-6"><section className="page-hero"><p className="eyebrow">Protect your attention</p><h1 className="mt-2 text-4xl font-black text-[#5a4632]">Lighthouse focus</h1><p className="mt-3 text-sm text-[#7a6652]">Choose one main priority and no more than two secondary priorities for the week.</p></section>
    <div className={`rounded-2xl p-4 text-sm font-bold ${main === 1 && secondary <= 2 ? "bg-[#edf7e9] text-[#47783b]" : "bg-[#fff0cd] text-[#8a6421]"}`}>Distraction risk: {main === 1 && secondary <= 2 ? "low" : "high"} · {main}/1 main · {secondary}/2 secondary</div>
    <div className={`rounded-2xl p-4 text-sm font-bold ${spreadRisk === "low" ? "bg-[#edf7e9] text-[#47783b]" : "bg-[#fff0cd] text-[#8a6421]"}`}>Active-work spread: {spreadRisk} · {activeGoals} goals · {activeProjects} projects</div>
    {error ? <div className="rounded-2xl bg-[#ffe0da] p-4 text-sm font-bold text-[#7a2626]">{error}</div> : null}
    <form className="panel grid gap-3 p-5 md:grid-cols-3" onSubmit={async (event) => { event.preventDefault(); try { const [type, id] = selected.split(":"); await api.focus.create({ goalId: type === "goal" ? Number(id) : null, projectId: type === "project" ? Number(id) : null, priorityType: kind }); await Promise.all([load(), useAppStore.getState().refreshVillage()]); setError(null); } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to set focus."); } }}>
      <select className="input" value={selected} onChange={(event) => setSelected(event.target.value)} required><option value="">Choose a goal or project</option><optgroup label="Goals">{goals.map((goal) => <option value={`goal:${goal.id}`} key={`goal-${goal.id}`}>{goal.title}</option>)}</optgroup><optgroup label="Projects">{projects.map((project) => <option value={`project:${project.id}`} key={`project-${project.id}`}>{project.title}</option>)}</optgroup></select>
      <select className="input" value={kind} onChange={(event) => setKind(event.target.value as "main" | "secondary")}><option value="main">Main priority</option><option value="secondary">Secondary priority</option></select>
      <button className="button-primary" type="submit"><Flag className="size-4" />Protect this focus</button>
    </form>
    <section className="grid gap-4 md:grid-cols-3">{priorities.map((priority) => <article className="panel p-5" key={priority.id}><p className="eyebrow">{priority.priority_type}</p><h2 className="mt-2 font-black text-[#5a4632]">{priority.goal_title ?? priority.project_title}</h2><button className="button-secondary mt-4" onClick={async () => { await api.focus.remove(priority.id); await Promise.all([load(), useAppStore.getState().refreshVillage()]); }}><Trash2 className="size-4" />Remove</button></article>)}</section>
    <section className="panel p-5"><h2 className="text-xl font-black text-[#5a4632]">Weekly challenge</h2><form className="mt-4 flex gap-2" onSubmit={async (event) => { event.preventDefault(); await api.focus.createChallenge({ title: challengeTitle, target: 5 }); setChallengeTitle(""); await load(); }}><input className="input" value={challengeTitle} onChange={(event) => setChallengeTitle(event.target.value)} placeholder="Example: Read on five days" required /><button className="button-primary" type="submit">Create</button></form><div className="mt-4 space-y-3">{challenges.map((challenge) => <article className="rounded-2xl bg-[#fffdf7] p-4" key={challenge.id}><strong>{challenge.title}</strong><p className="mt-2 text-sm">{challenge.progress}/{challenge.target}</p><button className="button-secondary mt-2" disabled={Boolean(challenge.is_completed)} onClick={async () => { await api.focus.updateChallenge(challenge.id, challenge.progress + 1); await Promise.all([load(), useAppStore.getState().refreshToday()]); }}>{challenge.is_completed ? "Completed · +100 XP" : "Add progress"}</button></article>)}</div></section>
  </div>;
}

