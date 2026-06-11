import { LogOut, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { navigationForRole } from "../../config/navigation";
import { useAppStore } from "../../store";

export function VillageMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const user = useAppStore((state) => state.user);
  const logout = useAppStore((state) => state.logout);
  if (!open) return null;
  return (
    <>
      <button aria-label="Close village menu" className="fixed inset-0 z-40 bg-[#163c38]/35 backdrop-blur-sm" onClick={onClose} />
      <section className="fixed right-4 top-4 z-50 w-[calc(100%-2rem)] max-w-sm rounded-[30px] border-2 border-white/80 bg-[#fff9e9]/95 p-5 text-[#405448] shadow-[0_24px_70px_rgba(32,65,55,.3)] sm:right-6 sm:top-6">
        <div className="flex items-center justify-between"><div><span className="island-eyebrow">Village directory</span><h2 className="m-0 mt-1 text-xl font-black">Explore LifeQuest</h2></div><button aria-label="Close menu" onClick={onClose} className="grid size-10 place-items-center rounded-2xl bg-[#efe6d1]"><X className="size-5" /></button></div>
        <nav className="mt-5 grid grid-cols-2 gap-2">
          {navigationForRole(user?.role).filter((item) => item.path !== "/").map(({ label, path, icon: Icon }) => (
            <Link key={path} to={path} onClick={onClose} className="flex items-center gap-2 rounded-2xl bg-[#f4ecd9] p-3 text-xs font-black transition hover:-translate-y-0.5 hover:bg-[#e7efdd]">
              <Icon className="size-4 text-[#6c9671]" />{label}
            </Link>
          ))}
        </nav>
        <button className="button-secondary mt-4 w-full" onClick={async () => { await logout(); onClose(); navigate("/login", { replace: true }); }}><LogOut className="size-4" />Log out</button>
      </section>
    </>
  );
}
