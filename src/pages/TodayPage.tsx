import { CheckCircle2, CheckSquare } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { useAppStore } from "../store";

export function TodayPage() {
  const { bootstrap, todaySnapshot, loading, completeQuest, logHabit } = useAppStore();
  useEffect(() => { void bootstrap(); }, [bootstrap]);
  if (!todaySnapshot && loading) return <LoadingState label="Preparing today" />;
  const quests = todaySnapshot?.quests.filter((quest) => !quest.is_completed) ?? [];
  const habits = todaySnapshot?.habits.filter((habit) => habit.due_today !== false) ?? [];
  return <div className="cozy-page">
    <PageHeader eyebrow="Daily path" title="Today" description="A short list of actions that will move your village forward." />
    <div className="grid gap-6 xl:grid-cols-2">
      <Card><div className="flex items-center justify-between gap-3"><h2 className="text-xl font-black">Today’s quests</h2><Link className="button-secondary" to="/quests">Manage all</Link></div>
        <div className="mt-4 space-y-3">{quests.length ? quests.map((quest) => <article key={quest.id} className="cozy-item"><StatusBadge variant={quest.priority === "critical" || quest.priority === "high" ? "high" : "medium"}>{quest.priority}</StatusBadge><h3 className="mt-2 font-black">{quest.title}</h3><p className="mt-1 text-sm text-text-secondary">{quest.description || "One clear action for today."}</p><Button className="mt-3" size="sm" icon={<CheckSquare className="size-4" />} onClick={() => completeQuest(quest.id)}>Complete</Button></article>) : <EmptyState icon={CheckSquare} title="No open quest today" description="Your quest list is clear. Choose a new action when you are ready." action="Manage quests" onAction={() => window.location.assign("/quests")} />}</div>
      </Card>
      <Card><div className="flex items-center justify-between gap-3"><h2 className="text-xl font-black">Today’s habits</h2><Link className="button-secondary" to="/habits">Manage all</Link></div>
        <div className="mt-4 space-y-3">{habits.length ? habits.map((habit) => <article key={habit.id} className="cozy-item"><StatusBadge variant="habit">{habit.current_streak} day streak</StatusBadge><h3 className="mt-2 font-black">{habit.name}</h3><p className="mt-1 text-sm text-text-secondary">{habit.description || "Keep the rhythm going."}</p><Button className="mt-3" size="sm" icon={<CheckCircle2 className="size-4" />} disabled={Boolean(habit.completed_today)} onClick={() => logHabit(habit.id, "Checked from Today")}>{habit.completed_today ? "Done today" : "Check in"}</Button></article>) : <EmptyState icon={CheckCircle2} title="No habits due today" description="Nothing else is scheduled for today." action="Manage habits" onAction={() => window.location.assign("/habits")} />}</div>
      </Card>
    </div>
  </div>;
}
