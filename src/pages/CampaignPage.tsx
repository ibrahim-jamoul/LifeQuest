import { Flame, Landmark, Printer, Sparkles, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { api, type CampaignChapter } from "../lib/api/client";
import { useAppStore } from "../store";

type AnnualSummary = Awaited<ReturnType<typeof api.campaigns.annualSummary>>;

export function CampaignPage() {
  const [campaign, setCampaign] = useState<{ id: number; title: string; school_year: string; annual_goal: string } | null>(null);
  const [chapters, setChapters] = useState<CampaignChapter[]>([]);
  const [annualSummary, setAnnualSummary] = useState<AnnualSummary | null>(null);
  const [title, setTitle] = useState("My school adventure");
  const [annualGoal, setAnnualGoal] = useState("");
  const load = async () => {
    const result = await api.campaigns.get();
    setCampaign(result.campaign);
    setChapters(result.chapters);
    if (result.campaign) setAnnualSummary(await api.campaigns.annualSummary());
  };
  useEffect(() => { void load(); }, []);
  if (!campaign) return <div className="space-y-6"><section className="page-hero"><p className="eyebrow">Annual journey</p><h1 className="mt-2 text-4xl font-black text-text-primary">Create your school campaign</h1></section><form className="panel max-w-2xl space-y-3 p-5" onSubmit={async (event) => { event.preventDefault(); const year = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`; await api.campaigns.create({ title, schoolYear: year, annualGoal }); await load(); }}><input className="input" value={title} onChange={(event) => setTitle(event.target.value)} required /><textarea className="input" value={annualGoal} onChange={(event) => setAnnualGoal(event.target.value)} placeholder="What do you want to be proud of this school year?" required /><button className="button-primary" type="submit"><Landmark className="size-4" />Start the campaign</button></form></div>;
  const summaryCards = annualSummary ? [
    { label: "Total XP", value: annualSummary.summary.total_xp, icon: Sparkles },
    { label: "Quests completed", value: annualSummary.summary.completed_quests, icon: Trophy },
    { label: "Habit check-ins", value: annualSummary.summary.habit_checkins, icon: Landmark },
    { label: "Best streak", value: annualSummary.summary.best_streak, icon: Flame },
  ] : [];
  return <div className="space-y-6"><section className="page-hero"><p className="eyebrow">{campaign.school_year}</p><h1 className="mt-2 text-4xl font-black text-text-primary">{campaign.title}</h1><p className="mt-3 text-sm text-text-secondary">{campaign.annual_goal}</p><button className="button-secondary mt-4 print:hidden" onClick={() => window.print()}><Printer className="size-4" />Print annual review</button></section>
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{summaryCards.map(({ label, value, icon: Icon }) => <article className="panel p-4" key={label}><Icon className="size-5 text-text-secondary" /><p className="eyebrow mt-3">{label}</p><strong className="mt-1 block text-2xl text-text-primary">{value}</strong></article>)}</section>
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{chapters.map((chapter) => <article className="panel p-5" key={chapter.id}><p className="eyebrow">Month {chapter.month_number}</p><h2 className="mt-2 font-black text-text-primary">{chapter.title}</h2><p className="mt-2 text-sm text-text-secondary">{chapter.theme}</p><div className="mt-4 h-3 overflow-hidden rounded-full bg-cream-secondary"><div className="h-full bg-cream-secondary" style={{ width: `${chapter.progress}%` }} /></div><input className="input mt-4 print:hidden" type="number" min="0" max="100" value={chapter.progress} onChange={(event) => setChapters((current) => current.map((item) => item.id === chapter.id ? { ...item, progress: Number(event.target.value) } : item))} /><button className="button-secondary mt-3 print:hidden" onClick={async () => { await api.campaigns.updateChapter(chapter.id, chapter.progress); await Promise.all([load(), useAppStore.getState().refreshVillage()]); }}>Save progress</button></article>)}</section>
  </div>;
}
