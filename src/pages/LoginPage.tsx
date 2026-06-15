import { Leaf, LogIn, Sparkles } from "lucide-react";
import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Brand } from "../components/Brand";
import { useAppStore } from "../store";

function MiniIsland() {
  return <svg className="mx-auto h-40 w-full max-w-xs" viewBox="0 0 320 150" aria-label="LifeQuest miniature island"><ellipse cx="160" cy="118" rx="130" ry="21" fill="#4FC3D9" opacity=".3"/><path d="M45 104Q58 41 126 43q50-42 101 0 48 8 50 61-31 34-94 27-85 17-138-27Z" fill="#8CCB68" stroke="#6FAF5C" strokeWidth="5"/><path d="M158 115q-20-40 0-77" fill="none" stroke="#E8C982" strokeWidth="14" strokeLinecap="round"/><g transform="translate(104 75)"><rect x="-28" y="-8" width="56" height="38" rx="7" fill="#F0D59D" stroke="#6B4F3A" strokeWidth="4"/><path d="M-35-7 0-39 35-7Z" fill="#E98255" stroke="#6B4F3A" strokeWidth="4"/><rect x="-6" y="10" width="12" height="20" rx="4" fill="#8B633E"/></g><g transform="translate(220 74)"><path d="M-18 36-12-26h24l6 62Z" fill="#FFF6E5" stroke="#6B4F3A" strokeWidth="4"/><path d="M-24-28 0-48 24-28Z" fill="#D95E4F" stroke="#6B4F3A" strokeWidth="4"/></g><circle cx="65" cy="76" r="18" fill="#6FAF5C"/><circle cx="261" cy="111" r="14" fill="#8FBF68"/></svg>;
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppStore((state) => state.user);
  const login = useAppStore((state) => state.login);
  const loading = useAppStore((state) => state.loading);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  if (user) return <Navigate to={user.role === "parent" ? "/parent" : "/"} replace />;
  return <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[linear-gradient(180deg,#aee8f5,#bfe7e1)] p-4"><div className="absolute left-[8%] top-[12%] text-primary/50"><Leaf className="size-12 -rotate-12"/></div><div className="absolute bottom-[10%] right-[9%] text-accent/60"><Sparkles className="size-14"/></div><section className="relative w-full max-w-md rounded-cozy-xl border-2 border-border bg-cream/95 p-7 shadow-cozy-lg backdrop-blur"><div className="flex justify-center"><Brand /></div><MiniIsland/><div className="text-center"><p className="eyebrow">Welcome back</p><h1 className="mt-2 text-3xl font-extrabold text-text-primary">Enter your village</h1><p className="mt-2 text-sm font-semibold text-text-secondary">Welcome back to your island!</p></div>{error ? <div className="mt-4 rounded-2xl border-2 border-border bg-danger-bg p-3 text-sm font-bold text-danger">{error}</div> : null}<form className="mt-6 space-y-4" onSubmit={async (event) => { event.preventDefault(); setError(null); try { const loggedInUser = await login(email, password); const requested = (location.state as { from?: string } | null)?.from; navigate(loggedInUser.role === "parent" ? "/parent" : requested || "/", { replace: true }); } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Email or password is incorrect."); } }}><label className="block"><span className="mb-2 block text-sm font-extrabold text-text-primary">Email</span><input className="input" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><label className="block"><span className="mb-2 block text-sm font-extrabold text-text-primary">Password</span><input className="input" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label><button className="button-primary w-full" type="submit" disabled={loading}><LogIn className="size-4" />{loading ? "Signing in..." : "Sign in"}</button></form></section></main>;
}
