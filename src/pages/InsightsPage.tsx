import { Activity, CheckCircle2, Flame, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "../lib/api/client";

export function InsightsPage() {
  const [data, setData] = useState<Awaited<ReturnType<typeof api.insights.get>> | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { void api.insights.get().then(setData).catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load insights.")); }, []);
  if (error) return <div className="rounded-2xl bg-[#ffe0da] p-4 text-sm font-bold text-[#7a2626]">{error}</div>;
  if (!data) return <div className="panel p-6">Loading insights...</div>;
  const cards = [
    { icon: Zap, label: "XP earned", value: data.totals.xp_30_days },
    { icon: CheckCircle2, label: "Quests completed", value: data.totals.quests_30_days },
    { icon: Activity, label: "Habit check-ins", value: data.totals.habits_30_days },
    { icon: Flame, label: "Best streak", value: data.totals.best_streak },
  ];
  return <div className="space-y-6">
    <section className="page-hero"><p className="eyebrow">See your progress</p><h1 className="mt-2 text-4xl font-black text-[#5a4632]">Insights</h1><p className="mt-3 text-sm text-[#7a6652]">Real actions become visible patterns over the last 30 days.</p></section>
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({ icon: Icon, label, value }) => <article className="panel p-4" key={label}><Icon className="size-5 text-[#6faf5c]" /><p className="eyebrow mt-3">{label}</p><strong className="mt-1 block text-2xl text-[#5a4632]">{value}</strong></article>)}</section>
    <section className="grid gap-6 xl:grid-cols-2">
      <div className="panel h-80 p-5"><h2 className="font-black text-[#5a4632]">XP timeline · 30 days</h2><ResponsiveContainer width="100%" height="85%"><AreaChart data={data.xpTimeline}><defs><linearGradient id="xpFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6faf5c" stopOpacity=".65" /><stop offset="1" stopColor="#6faf5c" stopOpacity=".05" /></linearGradient></defs><CartesianGrid stroke="#eadfc8" /><XAxis dataKey="day" hide /><YAxis /><Tooltip /><Area dataKey="xp" stroke="#5d8c61" fill="url(#xpFill)" type="monotone" /></AreaChart></ResponsiveContainer></div>
      <div className="panel h-80 p-5"><h2 className="font-black text-[#5a4632]">Habit activity · 30 days</h2><ResponsiveContainer width="100%" height="85%"><BarChart data={data.habitHeatmap}><CartesianGrid stroke="#eadfc8" /><XAxis dataKey="day" hide /><YAxis /><Tooltip /><Bar dataKey="completed" fill="#74b9d6" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></div>
    </section>
    <section className="panel p-5"><h2 className="font-black text-[#5a4632]">Local reminders</h2><div className="mt-4 space-y-3">{data.notifications.length ? data.notifications.map((item) => <article className="rounded-2xl bg-[#fffdf7] p-4" key={item.id}><strong>{item.title}</strong><p className="mt-1 text-sm text-[#7a6652]">{item.message}</p></article>) : <p className="text-sm text-[#7a6652]">No reminder right now. Keep following your daily rhythm.</p>}</div></section>
  </div>;
}
