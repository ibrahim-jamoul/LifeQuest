import { ArrowLeft, CheckSquare, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { projectApi, type ProjectMilestone, type ProjectNote, type ProjectRecord, type Quest } from "../lib/api/client";
import { ConfirmDialog } from "../components/ConfirmDialog";

export function ProjectDetailPage() {
  const { projectId } = useParams();
  const id = Number(projectId);
  const [data, setData] = useState<{ project: ProjectRecord; milestones: ProjectMilestone[]; notes: ProjectNote[]; tasks: Quest[] } | null>(null);
  const [milestone, setMilestone] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("");
  const [nextAction, setNextAction] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [roadmap, setRoadmap] = useState("");
  const [projectNotes, setProjectNotes] = useState("");
  const [riskLevel, setRiskLevel] = useState<"low" | "medium" | "high">("low");
  const [milestoneProgress, setMilestoneProgress] = useState(0);
  const [editingMilestoneId, setEditingMilestoneId] = useState<number | null>(null);
  const [noteContent, setNoteContent] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const load = async () => { try { setData(await projectApi.get(id)); setError(null); } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to load project."); } };
  useEffect(() => { void load(); }, [id]);
  useEffect(() => { if (data) { setStatus(data.project.status); setNextAction(data.project.next_action); setProjectTitle(data.project.title); setDescription(data.project.description); setPriority(data.project.priority); setRoadmap(data.project.roadmap); setProjectNotes(data.project.notes); setRiskLevel(data.project.risk_level); } }, [data?.project.id]);

  if (!data) return <div className="panel p-6">{error ?? "Loading project..."}</div>;
  return <div className="space-y-6">
    <section className="page-hero">
      <Link to="/projects" className="pill"><ArrowLeft className="size-4" />Projects</Link>
      <p className="eyebrow mt-5">Project workbench</p>
      <h1 className="mt-2 text-4xl font-black text-text-primary">{data.project.title}</h1>
      <p className="mt-3 text-sm text-text-secondary">{data.project.description || "Define the roadmap through milestones and notes."}</p>
    </section>
    {error ? <div className="rounded-2xl bg-danger-bg p-4 text-sm font-bold text-danger">{error}</div> : null}
    <form className="panel grid gap-3 p-5 md:grid-cols-2" onSubmit={async (event) => {
      event.preventDefault();
      try {
        await projectApi.update(id, { title: projectTitle, description, status, priority, roadmap, notes: projectNotes, riskLevel, nextAction });
        await load();
      } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to update project."); }
    }}>
      <input className="input md:col-span-2" value={projectTitle} onChange={(event) => setProjectTitle(event.target.value)} required />
      <textarea className="input md:col-span-2" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Project description" />
      <select className="input" value={status} onChange={(event) => setStatus(event.target.value)}><option value="idea">Idea</option><option value="active">Active</option><option value="paused">Paused</option><option value="completed">Completed</option></select>
      <select className="input" value={priority} onChange={(event) => setPriority(event.target.value)}><option value="low">Low priority</option><option value="medium">Medium priority</option><option value="high">High priority</option></select>
      <select className="input" value={riskLevel} onChange={(event) => setRiskLevel(event.target.value as typeof riskLevel)}><option value="low">Low risk</option><option value="medium">Medium risk</option><option value="high">High risk</option></select>
      <input className="input" value={nextAction} onChange={(event) => setNextAction(event.target.value)} placeholder="Next action" />
      <textarea className="input md:col-span-2" value={roadmap} onChange={(event) => setRoadmap(event.target.value)} placeholder="Roadmap" />
      <textarea className="input md:col-span-2" value={projectNotes} onChange={(event) => setProjectNotes(event.target.value)} placeholder="Project notes" />
      <button className="button-primary md:w-fit" type="submit">Save project details</button>
      <button className="button-secondary md:w-fit" type="button" onClick={() => setDeleteOpen(true)}><Trash2 className="size-4" />Delete project</button>
    </form>
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="panel p-5"><h2 className="text-lg font-black text-text-primary">Roadmap milestones</h2>
        <form className="mt-4 grid gap-2 sm:grid-cols-[1fr_8rem_auto]" onSubmit={async (event) => { event.preventDefault(); if (editingMilestoneId) await projectApi.updateMilestone(id, editingMilestoneId, { title: milestone, progress: milestoneProgress }); else await projectApi.addMilestone(id, { title: milestone, progress: milestoneProgress }); setMilestone(""); setMilestoneProgress(0); setEditingMilestoneId(null); await load(); }}>
          <input className="input" value={milestone} onChange={(event) => setMilestone(event.target.value)} placeholder="Next milestone" required /><input className="input" type="number" min="0" max="100" value={milestoneProgress} onChange={(event) => setMilestoneProgress(Number(event.target.value))} /><button className="button-primary" type="submit">{editingMilestoneId ? <Save className="size-4" /> : <Plus className="size-4" />}</button>
        </form>
        <div className="mt-4 space-y-3">{data.milestones.map((item) => <article className="rounded-2xl border-2 border-border bg-cream-light p-4" key={item.id}><div className="flex justify-between gap-3"><strong>{item.title}</strong><div className="flex gap-2"><button className="button-secondary px-3 py-2" onClick={() => { setEditingMilestoneId(item.id); setMilestone(item.title); setMilestoneProgress(item.progress); }}>Edit</button><button onClick={async () => { await projectApi.removeMilestone(id, item.id); await load(); }}><Trash2 className="size-4" /></button></div></div><p className="mt-2 text-xs">{item.progress}% complete</p></article>)}</div>
      </section>
      <section className="panel p-5"><h2 className="text-lg font-black text-text-primary">Project notes</h2>
        <form className="mt-4 space-y-2" onSubmit={async (event) => { event.preventDefault(); if (editingNoteId) await projectApi.updateNote(id, editingNoteId, { title: note, content: noteContent, noteType: "progress" }); else await projectApi.addNote(id, { title: note, content: noteContent, noteType: "progress" }); setNote(""); setNoteContent(""); setEditingNoteId(null); await load(); }}>
          <input className="input" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Capture a note" required /><textarea className="input" value={noteContent} onChange={(event) => setNoteContent(event.target.value)} placeholder="Note content" /><button className="button-primary" type="submit">{editingNoteId ? <Save className="size-4" /> : <Plus className="size-4" />}</button>
        </form>
        <div className="mt-4 space-y-3">{data.notes.map((item) => <article className="rounded-2xl border-2 border-border bg-cream-light p-4" key={item.id}><div className="flex justify-between gap-3"><strong>{item.title}</strong><div className="flex gap-2"><button className="button-secondary px-3 py-2" onClick={() => { setEditingNoteId(item.id); setNote(item.title); setNoteContent(item.content); }}>Edit</button><button onClick={async () => { await projectApi.removeNote(id, item.id); await load(); }}><Trash2 className="size-4" /></button></div></div><p className="mt-2 text-sm text-text-secondary">{item.content}</p></article>)}</div>
      </section>
    </div>
    <section className="panel p-5">
      <div className="flex items-center justify-between gap-3"><div><p className="eyebrow">Linked execution</p><h2 className="mt-2 text-lg font-black text-text-primary">Project quests</h2></div><Link className="button-secondary" to="/quests"><Plus className="size-4" />Manage quests</Link></div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {data.tasks.length ? data.tasks.map((task) => <article className="rounded-2xl border-2 border-border bg-cream-light p-4" key={task.id}><div className="flex items-start gap-3"><CheckSquare className={`mt-0.5 size-5 ${task.is_completed ? "text-primary" : "text-text-secondary"}`} /><div><strong className="text-text-primary">{task.title}</strong><p className="mt-1 text-sm text-text-secondary">{task.description || "No description"}</p><p className="mt-2 text-xs font-bold uppercase tracking-wide text-text-muted">{task.is_completed ? "Completed" : "Active"} · {task.xp_reward} XP</p></div></div></article>) : <p className="text-sm text-text-secondary">No quest is linked to this project yet. Use the project selector when creating a quest.</p>}
      </div>
    </section>
    <ConfirmDialog open={deleteOpen} title="Delete this project?" description="This action removes the project and cannot be undone." confirmLabel="Delete project" onClose={() => setDeleteOpen(false)} onConfirm={async () => { await projectApi.remove(id); window.location.assign("/projects"); }} />
  </div>;
}
