import { Compass, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { api, type DiscoveryChallenge, type DiscoveryDomain } from "../lib/api/client";
import { useAppStore } from "../store";

export function DiscoveryPage() {
  const [domains, setDomains] = useState<DiscoveryDomain[]>([]);
  const [challenges, setChallenges] = useState<DiscoveryChallenge[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const load = async () => { const data = await api.discovery.get(); setDomains(data.domains); setChallenges(data.challenges); };
  useEffect(() => { void load(); }, []);
  return <div className="space-y-6">
    <section className="page-hero"><p className="eyebrow">Explore the real world</p><h1 className="mt-2 text-4xl font-black text-[#5a4632]">Discovery Cove</h1><p className="mt-3 text-sm text-[#7a6652]">Choose a short challenge adapted to your age and turn curiosity into a real action.</p></section>
    {message ? <div className="rounded-2xl bg-[#edf7e9] p-4 text-sm font-bold text-[#47783b]">{message}</div> : null}
    <section className="grid gap-4 md:grid-cols-3">{domains.map((domain) => <article className="panel p-5" key={domain.id}><Compass className="size-6 text-[#dca84f]" /><h2 className="mt-3 font-black text-[#5a4632]">{domain.name}</h2><p className="mt-2 text-sm text-[#7a6652]">{domain.description}</p><span className="pill mt-4">{domain.completed_count}/{domain.challenge_count} completed</span></article>)}</section>
    <section className="panel p-5"><h2 className="text-xl font-black text-[#5a4632]">Weekly mini-challenges</h2><div className="mt-4 grid gap-3 lg:grid-cols-2">{challenges.map((challenge) => <article className="rounded-[22px] border-2 border-[#eadfc8] bg-[#fffdf7] p-4" key={challenge.id}><p className="eyebrow">{challenge.domain_name}</p><h3 className="mt-2 font-black text-[#5a4632]">{challenge.title}</h3><p className="mt-2 text-sm text-[#7a6652]">{challenge.description}</p><button className="button-primary mt-4" disabled={Boolean(challenge.completed)} onClick={async () => { await api.discovery.complete(challenge.id); await Promise.all([load(), useAppStore.getState().refreshToday(), useAppStore.getState().refreshVillage()]); setMessage(`Challenge completed. +${challenge.xp_reward} XP`); }}><Sparkles className="size-4" />{challenge.completed ? "Completed" : `Complete · +${challenge.xp_reward} XP`}</button></article>)}</div></section>
  </div>;
}
