import { BarChart3, Save, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api, type ReviewSummary } from "../lib/api/client";
import { useAppStore } from "../store";

const weeklyPrompts = ["What did I complete this week?", "What moved forward?", "What did I avoid?", "What blocked me?", "What should I focus on next week?", "Which goal matters most next week?", "What should I stop doing?"];
const monthlyPrompts = ["What created the most progress?", "What should change next month?", "What is the single recommended focus?"];

export function ReviewPage({ period }: { period: "weekly" | "monthly" }) {
  const prompts = period === "weekly" ? weeklyPrompts : monthlyPrompts;
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const refreshToday = useAppStore((state) => state.refreshToday);
  const refreshVillage = useAppStore((state) => state.refreshVillage);
  const dates = useMemo(() => {
    const end = new Date();
    const start = new Date(end);
    start.setDate(end.getDate() - (period === "weekly" ? 6 : 29));
    return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
  }, [period]);
  useEffect(() => {
    void api.reviews.list().then((reviews) => {
      const existing = reviews.find((review) => review.review_type === period && review.period_start === dates.start);
      if (!existing) return;
      try { setAnswers(JSON.parse(existing.answers_json) as Record<string, string>); } catch { setAnswers({}); }
      try { setSummary(JSON.parse(existing.summary_json) as ReviewSummary); } catch { setSummary(null); }
    });
  }, [dates.start, period]);

  return <div className="space-y-6">
    <header className="page-hero"><p className="eyebrow">Reflection system</p><h1 className="mb-2 mt-2 text-3xl font-black text-text-primary">{period === "weekly" ? "Weekly review" : "Monthly review"}</h1><p className="m-0 text-sm text-text-secondary">Review progress honestly, then choose the next useful move.</p></header>
    {message ? <div className="rounded-2xl border-2 border-border bg-cream-secondary p-4 text-sm font-bold text-text-secondary">{message}</div> : null}
    <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
      <form className="panel space-y-5 p-5 sm:p-6" onSubmit={async (event) => {
        event.preventDefault(); setSaving(true); setMessage(null);
        try {
          const result = await api.reviews.create({ reviewType: period, periodStart: dates.start, periodEnd: dates.end, answersJson: answers, summaryJson: { answered: Object.values(answers).filter(Boolean).length } });
          await Promise.all([refreshToday(), refreshVillage()]);
          setSummary(result.generatedSummary);
          setMessage(result.progression ? "Review saved. +75 XP earned." : "Review updated.");
        } catch (reason) { setMessage(reason instanceof Error ? reason.message : "Unable to save review."); } finally { setSaving(false); }
      }}>
        {prompts.map((prompt) => <label key={prompt} className="block"><span className="mb-2 block text-sm font-bold text-text-primary">{prompt}</span><textarea className="input min-h-24 resize-y" value={answers[prompt] ?? ""} onChange={(event) => setAnswers((current) => ({ ...current, [prompt]: event.target.value }))} placeholder="Write a short, useful answer..." /></label>)}
        <button className="button-primary" disabled={saving}><Save className="size-4" />{saving ? "Saving..." : "Complete review"}</button>
      </form>
      <aside className="panel h-fit p-5"><BarChart3 className="size-5 text-primary" /><h2 className="mb-2 mt-4 text-lg font-bold text-text-primary">Generated summary</h2>{summary ? <div className="space-y-2 text-sm text-text-secondary"><p>{summary.completedTasks} quests completed</p><p>{summary.habitCheckins} habit check-ins</p><p>{summary.xpGained} XP gained</p><p>{summary.goalsCompleted} goals completed · {summary.goalsDelayed} delayed</p><p>Best streak: {summary.bestStreak} days</p><p>Recommended focus: <strong>{summary.recommendedFocus}</strong></p></div> : <p className="text-sm leading-6 text-text-secondary">Complete the review to generate a summary from your real activity.</p>}<div className="mt-4 pill"><Sparkles className="size-4" />+75 XP first save</div></aside>
    </div>
  </div>;
}
