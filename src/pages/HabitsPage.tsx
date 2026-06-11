import { CheckCircle2, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "../components/EmptyState";
import { StatCard } from "../components/StatCard";
import { useAppStore } from "../store";
import { api } from "../lib/api/client";

const frequencies = ["daily", "weekly", "custom"] as const;

export function HabitsPage() {
  const bootstrap = useAppStore((state) => state.bootstrap);
  const habits = useAppStore((state) => state.habits);
  const loading = useAppStore((state) => state.loading);
  const error = useAppStore((state) => state.error);
  const createHabit = useAppStore((state) => state.createHabit);
  const logHabit = useAppStore((state) => state.logHabit);
  const removeHabit = useAppStore((state) => state.removeHabit);
  const refreshCollections = useAppStore((state) => state.refreshCollections);
  const flashMessage = useAppStore((state) => state.flashMessage);
  const clearFlashMessage = useAppStore((state) => state.clearFlashMessage);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Health");
  const [frequency, setFrequency] = useState<(typeof frequencies)[number]>("daily");
  const [customSchedule, setCustomSchedule] = useState("");
  const [goalId, setGoalId] = useState("");
  const [goals, setGoals] = useState<Array<{ id: number; title: string }>>([]);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    void refreshCollections();
    void api.goals.list().then(setGoals);
  }, [refreshCollections]);

  const completedToday = useMemo(() => habits.filter((habit) => Boolean(habit.completed_today)).length, [habits]);
  const categoryCount = useMemo(() => new Set(habits.map((habit) => habit.category)).size, [habits]);

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
        <p className="eyebrow">Consistency engine</p>
        <h1 className="text-3xl font-black tracking-tight">Habits</h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-400">Track repeatable actions, keep streaks visible, and make the daily baseline hard to ignore.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Habits" value={String(habits.length)} meta="Active repeatables" icon={CheckCircle2} />
        <StatCard label="Done today" value={String(completedToday)} meta="Checked in already" icon={CheckCircle2} accent="text-emerald-400" />
        <StatCard label="Categories" value={String(categoryCount)} meta="Active habit areas" icon={CheckCircle2} accent="text-sky-400" />
        <StatCard label="Loading" value={loading ? "Yes" : "No"} meta="Bootstrap state" icon={CheckCircle2} accent="text-violet-400" />
      </div>

      <section className="panel p-4 md:p-6">
        <h2 className="mb-4 text-lg font-bold">Create habit</h2>
        <form
          className="grid gap-3 md:grid-cols-2"
          onSubmit={async (event) => {
            event.preventDefault();
            await createHabit({
              name,
              description,
              category,
              frequency,
              customSchedule: customSchedule || null,
              goalId: goalId ? Number(goalId) : null,
            });
            setName("");
            setDescription("");
            setCategory("Health");
            setFrequency("daily");
            setCustomSchedule("");
            setGoalId("");
          }}
        >
          <input className="input" placeholder="Habit name" value={name} onChange={(event) => setName(event.target.value)} />
          <select className="input" value={frequency} onChange={(event) => setFrequency(event.target.value as (typeof frequencies)[number])}>
            {frequencies.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <input className="input" placeholder="Category" value={category} onChange={(event) => setCategory(event.target.value)} />
          <input className="input" placeholder="Custom schedule" value={customSchedule} onChange={(event) => setCustomSchedule(event.target.value)} />
          <input className="input md:col-span-2" placeholder="Description" value={description} onChange={(event) => setDescription(event.target.value)} />
          <select className="input md:col-span-2" value={goalId} onChange={(event) => setGoalId(event.target.value)}><option value="">No linked goal</option>{goals.map((goal) => <option key={goal.id} value={goal.id}>{goal.title}</option>)}</select>
          <button className="button-primary justify-center md:justify-self-start" type="submit" disabled={loading}><Plus className="size-4" />{loading ? "Saving..." : "Add habit"}</button>
        </form>
      </section>

      <section className="panel p-4 md:p-6">
        {habits.length === 0 ? (
          <EmptyState icon={CheckCircle2} title="No habits yet" description="Add the first repeatable action you want to make automatic." action="Create first habit" />
        ) : (
          <div className="space-y-3">
            {habits.map((habit) => (
              <article key={habit.id} className="flex flex-col gap-3 rounded-2xl border border-line bg-panel/70 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                    <span>{habit.frequency}</span>
                    <span>·</span>
                    <span>{habit.category}</span>
                    <span>·</span>
                    <span>{habit.current_streak} day streak</span>
                  </div>
                  <h3 className="mb-1 mt-2 text-base font-bold">{habit.name}</h3>
                  <p className="m-0 text-sm leading-6 text-slate-400">{habit.description || "No description"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="button-secondary" disabled={loading || Boolean(habit.completed_today)} onClick={() => logHabit(habit.id, "Checked from habits page")}>{habit.completed_today ? "Logged today" : "Log today"}</button>
                  <button className="button-secondary" disabled={loading} onClick={() => removeHabit(habit.id)}><Trash2 className="size-4" /></button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
