import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store";

export function ParentAccessPage() {
  const navigate = useNavigate();
  const switchToParent = useAppStore((state) => state.switchToParent);
  const loading = useAppStore((state) => state.loading);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <section className="page-hero">
        <p className="eyebrow">Protected parent space</p>
        <h1 className="mt-2 text-4xl font-black text-[#3f3528]">Parent access</h1>
        <p className="mt-3 text-sm leading-6 text-[#716452]">A parent signs in here without closing the child's active session.</p>
      </section>
      <form className="panel space-y-4 p-6" onSubmit={async (event) => {
        event.preventDefault();
        setError(null);
        try {
          await switchToParent(email, password);
          navigate("/parent", { replace: true });
        } catch (requestError) {
          setError(requestError instanceof Error ? requestError.message : "Unable to open parent access.");
        }
      }}>
        {error ? <div className="rounded-2xl border-2 border-[#efb7ad] bg-[#ffe0da] p-3 text-sm font-bold text-[#7a2626]">{error}</div> : null}
        <input className="input" type="email" autoComplete="email" placeholder="Parent email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        <input className="input" type="password" autoComplete="current-password" placeholder="Parent password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        <button className="button-primary w-full" type="submit" disabled={loading}><ShieldCheck className="size-4" />{loading ? "Opening..." : "Open parent lodge"}</button>
      </form>
    </div>
  );
}
