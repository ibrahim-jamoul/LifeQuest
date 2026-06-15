import { CalendarDays, CheckCircle2, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "../components/EmptyState";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { PageHeader } from "../components/PageHeader";
import { Toast } from "../components/Toast";
import { StatCard } from "../components/StatCard";
import { VillageMascot } from "../components/VillageMascot";
import { api, type Habit } from "../lib/api/client";
import { useAppStore } from "../store";

const frequencies = ["daily", "weekly", "custom"] as const;
type HabitLog = { id: number; completed_on: string; is_completed: number; note: string };

export function HabitsPage() {
  const { bootstrap, habits, loading, error, createHabit, logHabit, removeHabit, refreshCollections, flashMessage, clearFlashMessage } = useAppStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Health");
  const [frequency, setFrequency] = useState<Habit["frequency"]>("daily");
  const [customSchedule, setCustomSchedule] = useState("");
  const [goalId, setGoalId] = useState("");
  const [goals, setGoals] = useState<Array<{ id: number; title: string }>>([]);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [history, setHistory] = useState<{ habitId: number; logs: HabitLog[] } | null>(null);
  const [deleteHabit, setDeleteHabit] = useState<Habit | null>(null);

  useEffect(() => { void bootstrap(); }, [bootstrap]);
  useEffect(() => { void refreshCollections(); void api.goals.list().then(setGoals); }, [refreshCollections]);
  const completedToday = useMemo(() => habits.filter((habit) => Boolean(habit.completed_today)).length, [habits]);
  const categoryCount = useMemo(() => new Set(habits.map((habit) => habit.category)).size, [habits]);

  return <div className="cozy-page">
    {flashMessage ? <Toast message={flashMessage} onClose={clearFlashMessage} /> : null}
    {error ? <div className="rounded-2xl bg-danger-bg p-4 text-sm font-bold text-danger">{error}</div> : null}
    <PageHeader eyebrow="Consistency engine" title="Habits" description="Track repeatable actions, keep streaks visible, and make the daily baseline hard to ignore." />
    <div className="grid gap-4 md:grid-cols-4"><StatCard label="Habits" value={String(habits.length)} meta="Active repeatables" icon={CheckCircle2} /><StatCard label="Done today" value={String(completedToday)} meta="Checked in already" icon={CheckCircle2} accent="text-emerald-400" /><StatCard label="Categories" value={String(categoryCount)} meta="Active habit areas" icon={CheckCircle2} accent="text-sky-400" /><StatCard label="Loading" value={loading ? "Yes" : "No"} meta="Bootstrap state" icon={CheckCircle2} accent="text-violet-400" /></div>
    <section className="panel p-4 md:p-6"><h2 className="mb-4 text-lg font-bold">Create habit</h2>
      <form className="grid gap-3 md:grid-cols-2" onSubmit={async (event) => {
        event.preventDefault(); await createHabit({ name, description, category, frequency, customSchedule: customSchedule || null, goalId: goalId ? Number(goalId) : null });
        setName(""); setDescription(""); setCategory("Health"); setFrequency("daily"); setCustomSchedule(""); setGoalId("");
      }}>
        <input className="input" placeholder="Habit name" value={name} onChange={(event) => setName(event.target.value)} required />
        <select className="input" value={frequency} onChange={(event) => setFrequency(event.target.value as Habit["frequency"])}>{frequencies.map((item) => <option key={item} value={item}>{item}</option>)}</select>
        <input className="input" placeholder="Category" value={category} onChange={(event) => setCategory(event.target.value)} required />
        <input className="input" placeholder="Custom schedule" value={customSchedule} onChange={(event) => setCustomSchedule(event.target.value)} />
        <input className="input md:col-span-2" placeholder="Description" value={description} onChange={(event) => setDescription(event.target.value)} />
        <select className="input md:col-span-2" value={goalId} onChange={(event) => setGoalId(event.target.value)}><option value="">No linked goal</option>{goals.map((goal) => <option key={goal.id} value={goal.id}>{goal.title}</option>)}</select>
        <button className="button-primary justify-center md:justify-self-start" type="submit" disabled={loading}><Plus className="size-4" />{loading ? "Saving..." : "Add habit"}</button>
      </form>
    </section>
    <section className="panel p-4 md:p-6">
      {habits.length === 0 ? <EmptyState icon={CheckCircle2} title="No habits yet" description="Add the first repeatable action you want to make automatic." action="Create first habit" /> : <div className="space-y-3">{habits.map((habit) =>
        <article key={habit.id} className="cozy-item">
          {editingHabit?.id === habit.id ? <form className="grid gap-3 md:grid-cols-2" onSubmit={async (event) => {
            event.preventDefault(); await api.habits.update(habit.id, { name: editingHabit.name, description: editingHabit.description, category: editingHabit.category, frequency: editingHabit.frequency, customSchedule: editingHabit.custom_schedule, goalId: editingHabit.goal_id }); setEditingHabit(null); await refreshCollections();
          }}>
            <input aria-label="Edit habit name" className="input" value={editingHabit.name} onChange={(event) => setEditingHabit({ ...editingHabit, name: event.target.value })} required />
            <select aria-label="Edit habit frequency" className="input" value={editingHabit.frequency} onChange={(event) => setEditingHabit({ ...editingHabit, frequency: event.target.value as Habit["frequency"] })}>{frequencies.map((item) => <option key={item} value={item}>{item}</option>)}</select>
            <input aria-label="Edit habit category" className="input" value={editingHabit.category} onChange={(event) => setEditingHabit({ ...editingHabit, category: event.target.value })} required />
            <input aria-label="Edit habit schedule" className="input" value={editingHabit.custom_schedule ?? ""} onChange={(event) => setEditingHabit({ ...editingHabit, custom_schedule: event.target.value || null })} />
            <input aria-label="Edit habit description" className="input md:col-span-2" value={editingHabit.description} onChange={(event) => setEditingHabit({ ...editingHabit, description: event.target.value })} />
            <select aria-label="Edit habit goal" className="input md:col-span-2" value={editingHabit.goal_id ?? ""} onChange={(event) => setEditingHabit({ ...editingHabit, goal_id: event.target.value ? Number(event.target.value) : null })}><option value="">No linked goal</option>{goals.map((goal) => <option key={goal.id} value={goal.id}>{goal.title}</option>)}</select>
            <div className="flex gap-2 md:col-span-2"><button className="button-primary" type="submit"><Save className="size-4" />Save habit</button><button className="button-secondary" type="button" onClick={() => setEditingHabit(null)}><X className="size-4" />Cancel</button></div>
          </form> : <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div><div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wide text-text-secondary"><span className="pill">{habit.frequency}</span><span>·</span><span>{habit.category}</span><span>·</span><span>{habit.current_streak} day streak</span></div><h3 className="mb-1 mt-2 text-base font-bold">{habit.name}</h3><p className="m-0 text-sm leading-6 text-text-secondary">{habit.description || "No description"}</p></div>
            <div className="flex flex-wrap items-center gap-2"><button aria-label={`Edit ${habit.name}`} className="button-secondary" onClick={() => setEditingHabit(habit)}><Pencil className="size-4" /></button><button aria-label={`View history for ${habit.name}`} className="button-secondary" onClick={async () => setHistory({ habitId: habit.id, logs: await api.habits.logs(habit.id) })}><CalendarDays className="size-4" /></button><button className="button-secondary" disabled={loading || Boolean(habit.completed_today)} onClick={() => logHabit(habit.id, "Checked from habits page")}>{habit.completed_today ? "Logged today" : "Log today"}</button><button aria-label={`Delete ${habit.name}`} className="button-secondary" disabled={loading} onClick={() => setDeleteHabit(habit)}><Trash2 className="size-4" /></button></div>
          </div>}
          {history?.habitId === habit.id ? <div className="mt-4 rounded-2xl border-2 border-border bg-cream-light p-4"><div className="flex items-center justify-between"><strong className="text-sm text-text-primary">Last 30 days</strong><button aria-label="Close habit history" className="button-secondary p-2" onClick={() => setHistory(null)}><X className="size-4" /></button></div>{history.logs.length ? <ul className="mt-3 grid gap-2 sm:grid-cols-2">{history.logs.map((log) => <li className="rounded-xl bg-cream-secondary px-3 py-2 text-xs font-bold text-text-secondary" key={log.id}>{log.completed_on}{log.note ? ` · ${log.note}` : ""}</li>)}</ul> : <p className="mt-3 text-sm text-text-secondary">No check-in recorded in the last 30 days.</p>}</div> : null}
        </article>)}</div>}
    </section>
    <VillageMascot type="bear" message="Keep going, you’re doing great!" />
  </div>;
}
