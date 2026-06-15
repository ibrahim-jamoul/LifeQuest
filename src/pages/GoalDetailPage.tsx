import { ArrowLeft, CheckSquare, Flame, Plus, Save, Target, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { api, goalApi, type Habit, type Quest } from "../lib/api/client";
import { useAppStore } from "../store";

type GoalRecord = {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: string;
  deadline: string | null;
  status: string;
  progress: number;
  notes: string;
};

type MilestoneRecord = {
  id: number;
  title: string;
  description: string;
  due_date: string | null;
  progress: number;
  xp_reward: number;
};

type NoteRecord = {
  id: number;
  title: string;
  content: string;
  note_type: "reflection" | "action" | "idea" | "progress";
  created_at: string;
  updated_at?: string | null;
};

const noteTypeLabels: Record<NoteRecord["note_type"], string> = {
  reflection: "Reflection",
  action: "Action",
  idea: "Idea",
  progress: "Progress",
};

export function GoalDetailPage() {
  const { goalId } = useParams();
  const navigate = useNavigate();
  const bootstrap = useAppStore((state) => state.bootstrap);
  const [goal, setGoal] = useState<GoalRecord | null>(null);
  const [milestones, setMilestones] = useState<MilestoneRecord[]>([]);
  const [notes, setNotes] = useState<NoteRecord[]>([]);
  const [tasks, setTasks] = useState<Quest[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalDescription, setGoalDescription] = useState("");
  const [goalCategory, setGoalCategory] = useState("Scolaire");
  const [goalPriority, setGoalPriority] = useState<"low" | "medium" | "high" | "critical">("medium");
  const [goalDeadline, setGoalDeadline] = useState("");
  const [goalStatus, setGoalStatus] = useState<"not_started" | "in_progress" | "paused" | "completed">("in_progress");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [progress, setProgress] = useState(0);
  const [editingMilestoneId, setEditingMilestoneId] = useState<number | null>(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteType, setNoteType] = useState<NoteRecord["note_type"]>("reflection");
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const load = async () => {
    if (!goalId) return;
    const data = await goalApi.get(Number(goalId));
    setGoal(data.goal);
    setMilestones(data.milestones);
    setNotes(data.notes);
    setTasks(data.tasks);
    setHabits(data.habits);
    setGoalTitle(data.goal.title);
    setGoalDescription(data.goal.description);
    setGoalCategory(data.goal.category);
    setGoalPriority(data.goal.priority as "low" | "medium" | "high" | "critical");
    setGoalDeadline(data.goal.deadline ?? "");
    setGoalStatus(data.goal.status as "not_started" | "in_progress" | "paused" | "completed");
  };

  useEffect(() => {
    void bootstrap();
    void load();
  }, [bootstrap, goalId]);

  const completedMilestones = useMemo(() => milestones.filter((item) => item.progress >= 100).length, [milestones]);

  const editingMilestone = editingMilestoneId ? milestones.find((item) => item.id === editingMilestoneId) ?? null : null;
  const editingNote = editingNoteId ? notes.find((item) => item.id === editingNoteId) ?? null : null;

  const resetMilestoneForm = () => {
    setEditingMilestoneId(null);
    setTitle("");
    setDescription("");
    setDueDate("");
    setProgress(0);
  };

  const resetNoteForm = () => {
    setEditingNoteId(null);
    setNoteTitle("");
    setNoteContent("");
    setNoteType("reflection");
  };

  if (!goal) {
    return <EmptyState icon={Target} title="Goal not found" description="This goal does not exist or you do not have access to it." action="Go back" />;
  }

  return (
    <div className="space-y-6">
      <section className="page-hero space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/goals" className="pill"><ArrowLeft className="size-4" />Back</Link>
          <span className="pill">{goal.category}</span>
          <span className="pill">{goal.progress}%</span>
          <span className="pill">{completedMilestones}/{milestones.length} milestones</span>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1.4fr_.9fr]">
          <div>
            <p className="eyebrow">Goal workspace</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-text-primary">{goal.title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">{goal.description || "No description yet."}</p>
          </div>
          <div className="panel p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="eyebrow">Progress</p>
                <strong className="text-2xl text-text-primary">{goal.progress}%</strong>
              </div>
              <Flame className="size-7 text-accent" />
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-cream-secondary">
              <div className="h-full rounded-full bg-primary" style={{ width: `${goal.progress}%` }} />
            </div>
            <p className="mt-3 text-sm text-text-secondary">Level up the goal by completing milestones and small actions around it.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="button-primary" disabled={goal.status === "completed"} onClick={async () => { if (!goalId) return; await api.goals.complete(Number(goalId)); await Promise.all([load(), useAppStore.getState().refreshToday(), useAppStore.getState().refreshVillage()]); }}>Complete goal</button>
          <button className="button-secondary" onClick={() => setDeleteOpen(true)}><Trash2 className="size-4" />Delete goal</button>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
        <div className="space-y-4">
          <div className="panel p-5">
            <h2 className="text-lg font-black text-text-primary">Milestones</h2>
            <div className="mt-4 space-y-3">
              {milestones.length === 0 ? (
                <p className="text-sm text-text-secondary">No milestones yet. Add the first step of this goal.</p>
              ) : milestones.map((item) => (
                <article key={item.id} className="rounded-cozy-lg border-2 border-border bg-cream-light p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-black text-text-primary">{item.title}</h3>
                      <p className="mt-1 text-sm text-text-secondary">{item.description || "No description"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="pill">{item.progress}%</span>
                      <button
                        className="button-secondary px-3 py-2 text-xs"
                        onClick={() => {
                          setEditingMilestoneId(item.id);
                          setTitle(item.title);
                          setDescription(item.description || "");
                          setDueDate(item.due_date ?? "");
                          setProgress(item.progress);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="button-secondary px-3 py-2 text-xs"
                        onClick={async () => {
                          if (!goalId) return;
                          await goalApi.removeMilestone(Number(goalId), item.id);
                          void load();
                        }}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-cream-secondary">
                    <div className="h-full rounded-full bg-cream-secondary" style={{ width: `${item.progress}%` }} />
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="panel p-5">
            <h2 className="text-lg font-black text-text-primary">{editingMilestone ? "Edit milestone" : "Create milestone"}</h2>
            <form
              className="mt-4 grid gap-3 md:grid-cols-2"
              onSubmit={async (event) => {
                event.preventDefault();
                if (!goalId) return;
                if (editingMilestone) {
                  await goalApi.updateMilestone(Number(goalId), editingMilestone.id, { title, description, dueDate: dueDate || null, progress, xpReward: 100 });
                } else {
                  await goalApi.addMilestone(Number(goalId), { title, description, dueDate: dueDate || null, progress, xpReward: 100 });
                }
                resetMilestoneForm();
                void load();
              }}
            >
              <input className="input md:col-span-2" placeholder="Milestone title" value={title} onChange={(event) => setTitle(event.target.value)} required />
              <textarea className="input md:col-span-2" placeholder="Description" rows={4} value={description} onChange={(event) => setDescription(event.target.value)} />
              <input className="input" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
              <input className="input" type="number" min={0} max={100} value={progress} onChange={(event) => setProgress(Number(event.target.value))} />
              <div className="md:col-span-2 flex flex-wrap gap-3">
                <button className="button-primary md:w-fit" type="submit">{editingMilestone ? <><Save className="size-4" />Save milestone</> : <><Plus className="size-4" />Add milestone</>}</button>
                {editingMilestone ? (
                  <button className="button-secondary md:w-fit" type="button" onClick={resetMilestoneForm}>Cancel edit</button>
                ) : null}
              </div>
            </form>
          </div>
        </div>

        <div className="space-y-4">
          <div className="panel p-5">
            <h2 className="text-lg font-black text-text-primary">Goal details</h2>
            <form className="mt-4 space-y-3" onSubmit={async (event) => { event.preventDefault(); await api.goals.update(goal.id, { title: goalTitle, description: goalDescription, category: goalCategory, priority: goalPriority, deadline: goalDeadline || null, status: goalStatus, progress: goal.progress, notes: goal.notes }); await load(); }}>
              <input className="input" value={goalTitle} onChange={(event) => setGoalTitle(event.target.value)} required />
              <textarea className="input" value={goalDescription} onChange={(event) => setGoalDescription(event.target.value)} rows={3} />
              <select className="input" value={goalCategory} onChange={(event) => setGoalCategory(event.target.value)}>{["Scolaire","Lecture","Sport","Arts","Découverte","Habitudes","Projet personnel","Famille"].map((item) => <option key={item}>{item}</option>)}</select>
              <select className="input" value={goalPriority} onChange={(event) => setGoalPriority(event.target.value as typeof goalPriority)}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select>
              <select className="input" value={goalStatus} disabled={goal.status === "completed"} onChange={(event) => setGoalStatus(event.target.value as typeof goalStatus)}><option value="not_started">Not started</option><option value="in_progress">In progress</option><option value="paused">Paused</option>{goal.status === "completed" ? <option value="completed">Completed</option> : null}</select>
              <input className="input" type="date" value={goalDeadline} onChange={(event) => setGoalDeadline(event.target.value)} />
              <button className="button-primary" type="submit"><Save className="size-4" />Save goal details</button>
            </form>
          </div>

          <div className="panel p-5">
            <h2 className="text-lg font-black text-text-primary">Goal notes</h2>
            <form
              className="mt-4 space-y-3"
              onSubmit={async (event) => {
                event.preventDefault();
                if (!goalId) return;
                if (editingNote) {
                  await goalApi.updateNote(Number(goalId), editingNote.id, { title: noteTitle, content: noteContent, noteType });
                } else {
                  await goalApi.addNote(Number(goalId), { title: noteTitle, content: noteContent, noteType });
                }
                resetNoteForm();
                void load();
              }}
            >
              <input className="input" placeholder="Note title" value={noteTitle} onChange={(event) => setNoteTitle(event.target.value)} required />
              <select className="input" value={noteType} onChange={(event) => setNoteType(event.target.value as NoteRecord["note_type"])}>
                <option value="reflection">Reflection</option>
                <option value="action">Action</option>
                <option value="idea">Idea</option>
                <option value="progress">Progress</option>
              </select>
              <textarea className="input" placeholder="Note content" rows={5} value={noteContent} onChange={(event) => setNoteContent(event.target.value)} />
              <div className="flex flex-wrap gap-3">
                <button className="button-primary md:w-fit" type="submit">{editingNote ? <><Save className="size-4" />Save note</> : <><Plus className="size-4" />Add note</>}</button>
                {editingNote ? (
                  <button className="button-secondary md:w-fit" type="button" onClick={resetNoteForm}>Cancel edit</button>
                ) : null}
              </div>
            </form>
            <div className="mt-5 space-y-3">
              {notes.length === 0 ? (
                <p className="text-sm text-text-secondary">No notes yet. Capture ideas, blockers, or progress here.</p>
              ) : notes.map((note) => (
                <article key={note.id} className="rounded-cozy-lg border-2 border-border bg-cream-light p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-black text-text-primary">{note.title}</h3>
                        <span className="pill text-[11px]">{noteTypeLabels[note.note_type]}</span>
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-text-secondary">{note.content || "No content."}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="button-secondary px-3 py-2 text-xs"
                        onClick={() => {
                          setEditingNoteId(note.id);
                          setNoteTitle(note.title);
                          setNoteContent(note.content || "");
                          setNoteType(note.note_type);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="button-secondary px-3 py-2 text-xs"
                        onClick={async () => {
                          if (!goalId) return;
                          await goalApi.removeNote(Number(goalId), note.id);
                          void load();
                        }}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                  <p className="mt-3 flex items-center gap-2 text-xs text-text-muted">
                    <CheckSquare className="size-4" />
                    Created {new Date(note.created_at).toLocaleDateString()}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className="panel p-5">
            <h2 className="text-lg font-black text-text-primary">Linked actions</h2>
            <p className="mt-3 text-sm text-text-secondary">{tasks.length} linked quests · {habits.length} linked habits</p>
            <div className="mt-4 space-y-2">{tasks.map((task) => <div key={task.id} className="rounded-2xl bg-cream-light p-3 text-sm"><strong className="text-text-primary">{task.title}</strong><span className="ml-2 text-text-secondary">{task.is_completed ? "Completed" : "Active"}</span></div>)}{habits.map((habit) => <div key={habit.id} className="rounded-2xl bg-cream-light p-3 text-sm"><strong className="text-text-primary">{habit.name}</strong><span className="ml-2 text-text-secondary">{habit.current_streak} day streak</span></div>)}</div>
            <p className="mt-4 text-xs text-text-muted">Link new actions from the Quests and Habits creation forms.</p>
          </div>
        </div>
      </section>
      <ConfirmDialog open={deleteOpen} title="Delete this goal?" description="This action removes the goal and cannot be undone." confirmLabel="Delete goal" onClose={() => setDeleteOpen(false)} onConfirm={async () => { if (!goalId) return; await api.goals.remove(Number(goalId)); navigate("/goals"); }} />
    </div>
  );
}
