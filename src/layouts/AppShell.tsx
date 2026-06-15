import { Bell, LogOut, Menu, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Brand } from "../components/Brand";
import { ChildAvatar } from "../components/ChildAvatar";
import { CozyPageDecor } from "../components/CozyPageDecor";
import { navigationForRole } from "../config/navigation";
import { useAppStore } from "../store";
import { api, type NotificationRecord } from "../lib/api/client";

export function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [unread, setUnread] = useState(0);
  const [notificationError, setNotificationError] = useState<string | null>(null);
  const notificationPanelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const user = useAppStore((state) => state.user);
  const logout = useAppStore((state) => state.logout);
  const summary = useAppStore((state) => state.dashboardSummary);
  const profile = useAppStore((state) => state.todaySnapshot?.profile);
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
  useEffect(() => {
    if (!notificationsOpen) return;
    const handleClose = (event: KeyboardEvent | MouseEvent) => {
      if (event instanceof KeyboardEvent && event.key === "Escape") setNotificationsOpen(false);
      if (event instanceof MouseEvent && notificationPanelRef.current && !notificationPanelRef.current.contains(event.target as Node)) setNotificationsOpen(false);
    };
    document.addEventListener("keydown", handleClose);
    document.addEventListener("mousedown", handleClose);
    return () => {
      document.removeEventListener("keydown", handleClose);
      document.removeEventListener("mousedown", handleClose);
    };
  }, [notificationsOpen]);
  return (
    <div className="min-h-screen bg-cream">
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 overflow-hidden border-r-2 border-wood bg-wood p-4 text-cream shadow-cozy-lg transition-transform lg:translate-x-0 ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "repeating-linear-gradient(90deg,transparent 0 36px,#fff6e5 37px 38px)" }} />
        <div className="relative"><Brand inverse /></div>
        <nav className="relative mt-7 max-h-[calc(100vh-12rem)] space-y-1 overflow-y-auto pr-1">
          {navigationForRole(user?.role).map(({ label, path, icon: Icon }) => (
            <NavLink key={path} to={path} onClick={() => setMenuOpen(false)}
              className={({ isActive }) => `flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold transition ${isActive ? "bg-primary text-cream shadow-cozy-lg" : "text-cream/75 hover:bg-cream/10 hover:text-cream"}`}>
              <Icon className="size-4" />{label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-4 left-4 right-4 rounded-cozy-lg border-2 border-cream/20 bg-black/15 p-3 text-cream shadow-cozy-lg">
          <div className="flex items-center gap-3"><ChildAvatar size="md" icon={profile?.avatar_icon} color={profile?.avatar_color} /><div className="min-w-0"><p className="truncate font-display text-base font-bold">{user?.displayName ?? "LifeQuest"}</p><p className="text-xs font-extrabold text-secondary">{user?.role === "parent" ? "Parent lodge" : `Level ${summary?.level ?? 1}`}</p></div></div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/25"><div className="h-full rounded-full bg-accent" style={{ width: `${Math.min(100, ((summary?.totalXp ?? 0) % 500) / 5)}%` }} /></div>
          <p className="mb-0 mt-1 text-[11px] font-bold text-cream/65">{summary?.totalXp ?? 0} XP · next level at {Math.ceil(((summary?.totalXp ?? 0) + 1) / 500) * 500} XP</p>
        </div>
      </aside>

      {menuOpen && <button aria-label="Close menu" className="fixed inset-0 z-20 bg-black/60 lg:hidden" onClick={() => setMenuOpen(false)} />}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b-2 border-border bg-cream/95 px-4 backdrop-blur-xl sm:px-6">
          <button className="button-secondary p-2 lg:hidden" onClick={() => setMenuOpen(true)}><Menu className="size-4" /></button>
          <div />
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-2xl border-2 border-border bg-warning-bg px-3 py-2 text-xs font-black text-text-primary sm:flex"><Zap className="size-4 text-primary" />{summary?.currentStreak ?? 0} day streak</div>
            {user?.role === "child" ? <div className="relative" ref={notificationPanelRef}>
              <button aria-label={`Notifications, ${unread} unread`} className="button-secondary relative p-2" onClick={async () => { const next = !notificationsOpen; setNotificationsOpen(next); if (next) await loadNotifications(); }}><Bell className="size-4" />{unread ? <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-danger text-[10px] font-black text-white">{Math.min(unread, 9)}</span> : null}</button>
              {notificationsOpen ? <section aria-live="polite" className="absolute right-0 top-14 z-50 w-[min(22rem,calc(100vw-2rem))] rounded-cozy-lg border-2 border-border bg-cream p-4 shadow-lift">
                <div className="flex items-center justify-between gap-3"><div><p className="eyebrow">Local reminders</p><h2 className="mt-1 font-black text-text-primary">Notifications</h2></div>{unread ? <button className="text-xs font-black text-text-secondary" onClick={async () => { await api.notifications.markAllRead(); await loadNotifications(); }}>Mark all read</button> : null}</div>
                <div className="mt-3 max-h-80 space-y-2 overflow-auto">{notificationError ? <p className="rounded-2xl bg-danger-bg p-3 text-xs font-bold text-danger">{notificationError}</p> : notifications.length ? notifications.map((item) => <button className={`w-full rounded-2xl border-2 p-3 text-left ${item.is_read ? "border-border bg-cream-light" : "border-border bg-cream-secondary"}`} key={item.id} onClick={async () => { if (!item.is_read) { await api.notifications.markRead(item.id); await loadNotifications(); } }}><strong className="block text-sm text-text-primary">{item.title}</strong><span className="mt-1 block text-xs leading-5 text-text-secondary">{item.message}</span></button>) : <p className="text-sm text-text-secondary">No reminder right now.</p>}</div>
              </section> : null}
            </div> : null}
            <button aria-label="Log out" className="button-secondary p-2" onClick={async () => { await logout(); navigate("/login", { replace: true }); }}><LogOut className="size-4" /></button>
            <div className="grid size-9 place-items-center rounded-2xl bg-accent-magic text-sm font-black text-text-primary">{user?.displayName?.slice(0, 2).toUpperCase() ?? "LQ"}</div>
          </div>
        </header>
        <main className="internal-main relative z-[1] mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8"><Outlet /></main>
        <CozyPageDecor />
      </div>
    </div>
  );
}
