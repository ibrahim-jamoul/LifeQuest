import { Bell, LogOut, Menu, Search, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Brand } from "../components/Brand";
import { navigationForRole } from "../config/navigation";
import { useAppStore } from "../store";
import { api, type NotificationRecord } from "../lib/api/client";

export function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [unread, setUnread] = useState(0);
  const [notificationError, setNotificationError] = useState<string | null>(null);
  const navigate = useNavigate();
  const user = useAppStore((state) => state.user);
  const logout = useAppStore((state) => state.logout);
  const summary = useAppStore((state) => state.dashboardSummary);
  const loadNotifications = async () => {
    if (user?.role !== "child") return;
    try {
      const result = await api.notifications.list();
      setNotifications(result.notifications);
      setUnread(result.unread);
      setNotificationError(null);
    } catch (reason) {
      setNotificationError(reason instanceof Error ? reason.message : "Unable to load notifications.");
    }
  };
  useEffect(() => { void loadNotifications(); }, [user?.id, user?.role]);
  return (
    <div className="min-h-screen bg-[#dff0e8]">
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 border-r-2 border-[#d8c39e] bg-[#6b4f3a] p-4 text-[#fff8e9] shadow-[8px_0_30px_rgba(90,70,50,.18)] transition-transform lg:translate-x-0 ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <Brand />
        <nav className="mt-8 space-y-1">
          {navigationForRole(user?.role).map(({ label, path, icon: Icon }) => (
            <NavLink key={path} to={path} onClick={() => setMenuOpen(false)}
              className={({ isActive }) => `flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold transition ${isActive ? "bg-[#fff3da] text-[#5a4632]" : "text-[#f6ead6] hover:bg-white/10 hover:text-white"}`}>
              <Icon className="size-4" />{label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-4 left-4 right-4 rounded-[24px] border-2 border-[#d8c39e] bg-[#fff8e9] p-4 text-[#5a4632] shadow-[0_12px_30px_rgba(90,70,50,.12)]">
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-wide"><span>{user?.role === "parent" ? "Parent" : `Level ${summary?.level ?? 1}`}</span><span className="text-[#6faf5c]">{summary?.totalXp ?? 0} XP</span></div>
          <p className="mb-0 mt-3 text-xs font-medium text-[#8d7a64]">{user?.displayName ?? "LifeQuest"}</p>
        </div>
      </aside>

      {menuOpen && <button aria-label="Close menu" className="fixed inset-0 z-20 bg-black/60 lg:hidden" onClick={() => setMenuOpen(false)} />}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b-2 border-[#eadfc8] bg-[#fff8e9]/95 px-4 backdrop-blur-xl sm:px-6">
          <button className="button-secondary p-2 lg:hidden" onClick={() => setMenuOpen(true)}><Menu className="size-4" /></button>
          <div className="hidden max-w-md flex-1 items-center gap-2 rounded-2xl border-2 border-[#eadfc8] bg-[#fffdf7] px-3 py-2 text-[#8d7a64] sm:flex">
            <Search className="size-4" /><span className="text-sm">Search anything...</span><span className="ml-auto text-xs">Ctrl K</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-2xl border-2 border-[#eadfc8] bg-[#fff3da] px-3 py-2 text-xs font-black text-[#5a4632] sm:flex"><Zap className="size-4 text-[#6faf5c]" />{summary?.currentStreak ?? 0} day streak</div>
            {user?.role === "child" ? <div className="relative">
              <button aria-label={`Notifications, ${unread} unread`} className="button-secondary relative p-2" onClick={async () => { const next = !notificationsOpen; setNotificationsOpen(next); if (next) await loadNotifications(); }}><Bell className="size-4" />{unread ? <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-[#e87967] text-[10px] font-black text-white">{Math.min(unread, 9)}</span> : null}</button>
              {notificationsOpen ? <section className="absolute right-0 top-14 z-50 w-[min(22rem,calc(100vw-2rem))] rounded-[24px] border-2 border-[#eadfc8] bg-[#fff8e9] p-4 shadow-[0_18px_50px_rgba(90,70,50,.24)]">
                <div className="flex items-center justify-between gap-3"><div><p className="eyebrow">Local reminders</p><h2 className="mt-1 font-black text-[#5a4632]">Notifications</h2></div>{unread ? <button className="text-xs font-black text-[#6b8f5c]" onClick={async () => { await api.notifications.markAllRead(); await loadNotifications(); }}>Mark all read</button> : null}</div>
                <div className="mt-3 max-h-80 space-y-2 overflow-auto">{notificationError ? <p className="rounded-2xl bg-[#ffe0da] p-3 text-xs font-bold text-[#7a2626]">{notificationError}</p> : notifications.length ? notifications.map((item) => <button className={`w-full rounded-2xl border-2 p-3 text-left ${item.is_read ? "border-[#eadfc8] bg-[#fffdf7]" : "border-[#b8d7a9] bg-[#edf7e9]"}`} key={item.id} onClick={async () => { if (!item.is_read) { await api.notifications.markRead(item.id); await loadNotifications(); } }}><strong className="block text-sm text-[#5a4632]">{item.title}</strong><span className="mt-1 block text-xs leading-5 text-[#7a6652]">{item.message}</span></button>) : <p className="text-sm text-[#7a6652]">No reminder right now.</p>}</div>
              </section> : null}
            </div> : null}
            <button aria-label="Log out" className="button-secondary p-2" onClick={async () => { await logout(); navigate("/login", { replace: true }); }}><LogOut className="size-4" /></button>
            <div className="grid size-9 place-items-center rounded-2xl bg-[#cfa7ff] text-sm font-black text-[#4a3a5f]">{user?.displayName?.slice(0, 2).toUpperCase() ?? "LQ"}</div>
          </div>
        </header>
        <main className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8"><Outlet /></main>
      </div>
    </div>
  );
}
