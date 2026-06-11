import { LogIn, Sparkles } from "lucide-react";
import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAppStore } from "../store";

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

  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,#f9efd7,#dff0e8_55%,#b9ddd6)] p-4">
      <section className="w-full max-w-md rounded-[34px] border-2 border-white/80 bg-[#fff6e5]/95 p-7 shadow-[0_24px_70px_rgba(74,92,70,.2)]">
        <div className="grid size-14 place-items-center rounded-3xl bg-[#6faf5c] text-white shadow-[0_6px_0_#5d8c61]"><Sparkles className="size-7" /></div>
        <p className="eyebrow mt-6">Welcome to LifeQuest</p>
        <h1 className="mt-2 text-3xl font-black text-[#3f3528]">Enter your village</h1>
        <p className="mt-3 text-sm leading-6 text-[#716452]">Sign in with your child or parent account to continue.</p>
        {error ? <div className="mt-4 rounded-2xl border-2 border-[#efb7ad] bg-[#ffe0da] p-3 text-sm font-bold text-[#7a2626]">{error}</div> : null}
        <form className="mt-6 space-y-4" onSubmit={async (event) => {
          event.preventDefault();
          setError(null);
          try {
            const loggedInUser = await login(email, password);
            const requested = (location.state as { from?: string } | null)?.from;
            navigate(loggedInUser.role === "parent" ? "/parent" : requested || "/", { replace: true });
          } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : "Email or password is incorrect.");
          }
        }}>
          <label className="block"><span className="mb-2 block text-sm font-extrabold text-[#5a4632]">Email</span><input className="input" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
          <label className="block"><span className="mb-2 block text-sm font-extrabold text-[#5a4632]">Password</span><input className="input" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
          <button className="button-primary w-full" type="submit" disabled={loading}><LogIn className="size-4" />{loading ? "Signing in..." : "Sign in"}</button>
        </form>
      </section>
    </main>
  );
}
