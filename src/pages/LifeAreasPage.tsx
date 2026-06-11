import { HeartPulse } from "lucide-react";
import { useEffect, useState } from "react";
import { api, type LifeArea } from "../lib/api/client";

export function LifeAreasPage() {
  const [areas, setAreas] = useState<LifeArea[]>([]);
  const [error, setError] = useState<string | null>(null);
  const load = async () => { try { setAreas(await api.lifeAreas.list()); setError(null); } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to load life areas."); } };
  useEffect(() => { void load(); }, []);
  return <div className="space-y-6"><section className="page-hero"><p className="eyebrow">Balanced growth</p><h1 className="mt-2 text-4xl font-black text-[#5a4632]">Life areas</h1><p className="mt-3 text-sm text-[#7a6652]">A simple check-in across the areas that help you grow.</p></section>{error ? <div className="rounded-2xl bg-[#ffe0da] p-4 text-sm font-bold text-[#7a2626]">{error}</div> : null}
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{areas.map((area) => <article className="panel p-5" key={area.id}><div className="flex justify-between"><div><p className="eyebrow">{area.trend}</p><h2 className="mt-2 font-black text-[#5a4632]">{area.name}</h2></div><HeartPulse className="size-6 text-[#e87967]" /></div><p className="mt-3 text-xs font-bold text-[#7a6652]">{area.active_goals} active goals · {area.weekly_activity} actions this week</p><div className="mt-4 h-3 overflow-hidden rounded-full bg-[#eadfc8]"><div className="h-full bg-[#6faf5c]" style={{ width: `${area.score}%` }} /></div><div className="mt-4 flex items-center gap-2"><input className="input" type="number" min="0" max="100" value={area.score} onChange={(event) => setAreas((current) => current.map((item) => item.id === area.id ? { ...item, score: Number(event.target.value) } : item))} /><select className="input" value={area.trend} onChange={(event) => setAreas((current) => current.map((item) => item.id === area.id ? { ...item, trend: event.target.value as LifeArea["trend"] } : item))}><option value="improving">Improving</option><option value="stable">Stable</option><option value="declining">Needs attention</option></select></div><button className="button-secondary mt-3" onClick={async () => { await api.lifeAreas.update(area.id, { score: area.score, trend: area.trend }); await load(); }}>Save check-in</button></article>)}</section>
  </div>;
}
