import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "../lib/api/client";

export function InsightsPage() {
  const [data, setData] = useState<Awaited<ReturnType<typeof api.insights.get>> | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { void api.insights.get().then(setData).catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load insights.")); }, []);
  if (error) return <div className="rounded-2xl bg-[#ffe0da] p-4 text-sm font-bold text-[#7a2626]">{error}</div>;
  if (!data) return <div className="panel p-6">Loading insights...</div>;
  return <div className="space-y-6"><section className="page-hero"><p className="eyebrow">See your progress</p><h1 className="mt-2 text-4xl font-black text-[#5a4632]">Insights</h1><p className="mt-3 text-sm text-[#7a6652]">Real actions become visible patterns.</p></section>
    <section className="grid gap-6 xl:grid-cols-2"><div className="panel h-80 p-5"><h2 className="font-black text-[#5a4632]">XP timeline · 30 days</h2><ResponsiveContainer width="100%" height="85%"><BarChart data={data.xpTimeline}><CartesianGrid stroke="#eadfc8" /><XAxis dataKey="day" hide /><YAxis /><Tooltip /><Bar dataKey="xp" fill="#6faf5c" radius={[8,8,0,0]} /></BarChart></ResponsiveContainer></div><div className="panel h-80 p-5"><h2 className="font-black text-[#5a4632]">Habit activity · 30 days</h2><ResponsiveContainer width="100%" height="85%"><BarChart data={data.habitHeatmap}><CartesianGrid stroke="#eadfc8" /><XAxis dataKey="day" hide /><YAxis /><Tooltip /><Bar dataKey="completed" fill="#74b9d6" radius={[8,8,0,0]} /></BarChart></ResponsiveContainer></div></section>
    <section className="panel p-5"><h2 className="font-black text-[#5a4632]">Local reminders</h2><div className="mt-4 space-y-3">{data.notifications.length ? data.notifications.map((item) => <article className="rounded-2xl bg-[#fffdf7] p-4" key={item.id}><strong>{item.title}</strong><p className="mt-1 text-sm text-[#7a6652]">{item.message}</p></article>) : <p className="text-sm text-[#7a6652]">No reminder right now. Keep following your daily rhythm.</p>}</div></section>
  </div>;
}
