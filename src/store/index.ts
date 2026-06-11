import { create } from "zustand";
import { api, clearRoleToken, getRoleToken, getToken, saveRoleToken, setToken, type AuthUser, type DashboardSummary, type Habit, type Quest, type TodaySnapshot, type VillageState } from "../lib/api/client";

interface AppState {
  token: string | null;
  ready: boolean;
  loading: boolean;
  error: string | null;
  user: AuthUser | null;
  todaySnapshot: TodaySnapshot | null;
  dashboardSummary: DashboardSummary | null;
  villageState: VillageState | null;
  flashMessage: string | null;
  quests: Quest[];
  habits: Habit[];
  bootstrap: () => Promise<void>;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  switchToParent: (email: string, password: string) => Promise<void>;
  returnToChild: () => Promise<void>;
  refreshToday: () => Promise<void>;
  refreshVillage: () => Promise<void>;
  refreshCollections: () => Promise<void>;
  clearFlashMessage: () => void;
  completeQuest: (id: number) => Promise<void>;
  logHabit: (id: number, note?: string) => Promise<void>;
  createQuest: (input: Parameters<typeof api.quests.create>[0]) => Promise<void>;
  createHabit: (input: Parameters<typeof api.habits.create>[0]) => Promise<void>;
  removeQuest: (id: number) => Promise<void>;
  removeHabit: (id: number) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  token: getToken(),
  ready: false,
  loading: false,
  error: null,
  user: null,
  todaySnapshot: null,
  dashboardSummary: null,
  villageState: null,
  flashMessage: null,
  quests: [],
  habits: [],

  bootstrap: async () => {
    if (get().ready && get().user) return;
    set({ loading: true, error: null });
    const token = getToken();
    if (!token) {
      set({ token: null, user: null, ready: true, loading: false });
      return;
    }
    try {
      const me = await api.auth.me();
      saveRoleToken(me.user.role, token);
      set({ token, user: me.user });
      if (me.user.role === "child") {
        await Promise.all([get().refreshToday(), get().refreshVillage(), get().refreshCollections()]);
      }
      set({ ready: true, loading: false });
    } catch (error) {
      setToken(null);
      set({ token: null, user: null, loading: false, ready: true, error: error instanceof Error ? error.message : "Unable to bootstrap LifeQuest." });
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const session = await api.auth.login(email, password);
      setToken(session.token);
      const me = await api.auth.me();
      saveRoleToken(me.user.role, session.token);
      set({ token: session.token, user: me.user, ready: true });
      if (me.user.role === "child") {
        await Promise.all([get().refreshToday(), get().refreshVillage(), get().refreshCollections()]);
      }
      set({ loading: false });
      return me.user;
    } catch (error) {
      setToken(null);
      const message = error instanceof Error ? error.message : "Unable to sign in.";
      set({ loading: false, error: message });
      throw error;
    }
  },

  logout: async () => {
    const role = get().user?.role;
    try {
      await api.auth.logout();
    } catch {
      // Local session cleanup must still complete when the API is unavailable.
    }
    setToken(null);
    if (role) clearRoleToken(role);
    set({
      token: null,
      user: null,
      ready: true,
      loading: false,
      error: null,
      todaySnapshot: null,
      dashboardSummary: null,
      villageState: null,
      quests: [],
      habits: [],
    });
  },

  switchToParent: async (email, password) => {
    const childToken = get().user?.role === "child" ? getToken() : getRoleToken("child");
    if (childToken) saveRoleToken("child", childToken);
    set({ loading: true, error: null });
    try {
      const session = await api.auth.login(email, password);
      setToken(session.token);
      const me = await api.auth.me();
      if (me.user.role !== "parent") throw new Error("A parent account is required.");
      saveRoleToken("parent", session.token);
      set({ token: session.token, user: me.user, ready: true, loading: false, todaySnapshot: null, dashboardSummary: null, villageState: null, quests: [], habits: [] });
    } catch (error) {
      if (childToken) setToken(childToken);
      set({ loading: false, error: error instanceof Error ? error.message : "Unable to open the parent lodge." });
      throw error;
    }
  },

  returnToChild: async () => {
    const childToken = getRoleToken("child");
    if (!childToken) throw new Error("No child session is available.");
    setToken(childToken);
    set({ token: childToken, ready: false, user: null, error: null });
    await get().bootstrap();
  },

  refreshToday: async () => {
    const [todaySnapshot, dashboardSummary] = await Promise.all([api.dashboard.today(), api.dashboard.summary()]);
    set({ todaySnapshot, dashboardSummary, quests: todaySnapshot.quests, habits: todaySnapshot.habits });
  },

  refreshVillage: async () => {
    const villageState = await api.village.state();
    set({ villageState });
  },

  clearFlashMessage: () => set({ flashMessage: null }),

  refreshCollections: async () => {
    const [quests, habits] = await Promise.all([api.quests.list("all"), api.habits.list()]);
    set({ quests, habits });
  },

  completeQuest: async (id: number) => {
    set({ loading: true, error: null });
    try { await api.quests.complete(id); set({ flashMessage: "Quest completed. XP gained." }); await Promise.all([get().refreshToday(), get().refreshVillage(), get().refreshCollections()]); }
    catch (error) { set({ error: error instanceof Error ? error.message : "Unable to complete quest." }); }
    finally { set({ loading: false }); }
  },

  logHabit: async (id: number, note?: string) => {
    set({ loading: true, error: null });
    try { await api.habits.log(id, note ?? ""); set({ flashMessage: "Habit logged. Streak updated." }); await Promise.all([get().refreshToday(), get().refreshVillage(), get().refreshCollections()]); }
    catch (error) { set({ error: error instanceof Error ? error.message : "Unable to log habit." }); }
    finally { set({ loading: false }); }
  },

  createQuest: async (input) => {
    set({ loading: true, error: null });
    try { await api.quests.create(input); await Promise.all([get().refreshToday(), get().refreshCollections()]); }
    catch (error) { set({ error: error instanceof Error ? error.message : "Unable to create quest." }); }
    finally { set({ loading: false }); }
  },

  createHabit: async (input) => {
    set({ loading: true, error: null });
    try { await api.habits.create(input); await Promise.all([get().refreshToday(), get().refreshCollections()]); }
    catch (error) { set({ error: error instanceof Error ? error.message : "Unable to create habit." }); }
    finally { set({ loading: false }); }
  },

  removeQuest: async (id: number) => {
    await api.quests.remove(id);
    set({ flashMessage: "Quest removed." });
    await get().refreshToday();
    await get().refreshCollections();
  },

  removeHabit: async (id: number) => {
    await api.habits.remove(id);
    set({ flashMessage: "Habit removed." });
    await get().refreshToday();
    await get().refreshCollections();
  },
}));
