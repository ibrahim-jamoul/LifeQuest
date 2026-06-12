const API_URL = import.meta.env.VITE_API_URL ?? "/api";
const TOKEN_KEY = "lifequest.token";
const CHILD_TOKEN_KEY = "lifequest.child-token";
const PARENT_TOKEN_KEY = "lifequest.parent-token";

export type UserRole = "child" | "parent";

export interface AuthUser {
  id: number;
  email: string;
  displayName: string;
  role: UserRole;
}

export interface ChildProfile {
  age: number | null;
  grade: string | null;
  age_group: "7-9" | "10-12" | "13-16";
  village_level: number;
  parent_id: number | null;
  avatar_icon: "spark" | "leaf" | "star" | "compass";
  avatar_color: string;
}

export interface Quest {
  id: number;
  title: string;
  description: string;
  due_date: string | null;
  priority: "low" | "medium" | "high" | "critical";
  estimated_minutes: number | null;
  is_completed: number | boolean;
  goal_id: number | null;
  project_id: number | null;
  xp_reward: number;
  created_at: string;
  updated_at: string;
}

export interface Habit {
  id: number;
  goal_id: number | null;
  name: string;
  description: string;
  frequency: "daily" | "weekly" | "custom";
  category: string;
  custom_schedule: string | null;
  current_streak: number;
  longest_streak: number;
  xp_reward: number;
  is_active: number | boolean;
  completed_today?: number | boolean;
  due_today?: boolean;
}

export interface Achievement {
  id: number;
  code: string;
  name: string;
  description: string;
  icon: string | null;
  xp_reward: number;
  unlocked: number | boolean;
  unlocked_at: string | null;
}

export interface ParentChildMission {
  id: number;
  child_id: number;
  parent_id: number;
  child_name: string;
  parent_name: string;
  title: string;
  description: string;
  xp_reward: number;
  status: "pending" | "child_submitted" | "completed" | "expired";
  validated_by_parent: number | boolean;
  completed_at: string | null;
}

export interface ParentChildSummary {
  id: number;
  display_name: string;
  total_xp: number;
  current_streak: number;
  age: number;
  grade: string;
  age_group: string;
  village_level: number;
  level: number;
  activeQuests: number;
  activeHabits: number;
  completedQuests: number;
  pendingMissions: number;
}

export interface TodaySnapshot {
  date: string;
  user: AuthUser;
  profile: ChildProfile;
  quests: Quest[];
  habits: Habit[];
  focusPriorities: DashboardFocusPriority[];
  todayQuests: DashboardQuestFallback[];
  lifeBalance: DashboardLifeArea[];
  currentChapter?: { title: string; theme: string; progress: number } | null;
  progression: {
    totalXp: number;
    currentStreak: number;
    activeParentMissions: number;
  };
}

export interface VillageState {
  villageLevel: number;
  globalXP: number;
  currentStreak: number;
  zones: {
    garden: { level: number; progress: number; currentStreak: number; longestStreak: number };
    home_area: { level: number; progress: number; activeHabits: number; completionRate: number };
    workshop: { level: number; progress: number };
    learning: { level: number; progress: number };
    market: { level: number; progress: number };
    town_hall: { level: number; progress: number };
    lighthouse: { level: number; progress: number };
    pathways: { level: number; progress: number };
  };
}

export interface DiscoveryChallenge { id: number; domain_id: number; domain_name: string; title: string; description: string; xp_reward: number; completed: number | boolean }
export interface DiscoveryDomain { id: number; name: string; icon: string; description: string; challenge_count: number; completed_count: number }
export interface FocusPriority { id: number; priority_type: "main" | "secondary"; goal_id: number | null; project_id: number | null; goal_title: string | null; project_title: string | null }
export interface DashboardFocusPriority extends FocusPriority { focus_progress: number }
export interface DashboardLifeArea { name: string; score: number }
export interface DashboardQuestFallback { id: number; title: string; xp_reward: number; priority: Quest["priority"] }
export interface WeeklyChallenge { id: number; title: string; description: string; target: number; progress: number; xp_reward: number; is_completed: number | boolean }
export interface ReviewSummary { completedTasks: number; habitCheckins: number; xpGained: number; goalsCompleted: number; goalsDelayed: number; bestStreak: number; strongestArea: string | null; weakestArea: string | null; recommendedFocus: string }
export interface ReviewRecord { id: number; review_type: "weekly" | "monthly"; period_start: string; period_end: string; answers_json: string; summary_json: string }
export interface LifeArea { id: number; name: string; score: number; trend: "improving" | "stable" | "declining"; active_goals: number; weekly_activity: number }
export interface CampaignChapter { id: number; month_number: number; title: string; theme: string; progress: number; is_completed: number | boolean }
export interface ProjectRecord { id: number; title: string; description: string; status: string; priority: string; roadmap: string; notes: string; risk_level: "low" | "medium" | "high"; next_action: string }
export interface ProjectMilestone { id: number; title: string; description: string; due_date: string | null; progress: number; is_completed: number | boolean }
export interface ProjectNote { id: number; title: string; content: string; note_type: "reflection" | "action" | "idea" | "progress" }
export interface NotificationRecord { id: number; title: string; message: string; notification_type: string; is_read: number | boolean; created_at: string }

export interface DashboardSummary {
  activeGoals: number;
  totalXp: number;
  currentStreak: number;
  level: number;
  levelTitle: string;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json", ...(options.headers as Record<string, string> | undefined) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.error ?? `Request failed: ${response.status}`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (!token) localStorage.removeItem(TOKEN_KEY);
  else localStorage.setItem(TOKEN_KEY, token);
}

export function saveRoleToken(role: UserRole, token: string) {
  localStorage.setItem(role === "child" ? CHILD_TOKEN_KEY : PARENT_TOKEN_KEY, token);
}

export function getRoleToken(role: UserRole): string | null {
  return localStorage.getItem(role === "child" ? CHILD_TOKEN_KEY : PARENT_TOKEN_KEY);
}

export function clearRoleToken(role: UserRole) {
  localStorage.removeItem(role === "child" ? CHILD_TOKEN_KEY : PARENT_TOKEN_KEY);
}

export const api = {
  auth: {
    login: (email: string, password: string) => request<{ token: string }>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
    me: () => request<{ user: AuthUser; profile: ChildProfile | Record<string, unknown> }>("/auth/me"),
    logout: () => request<void>("/auth/logout", { method: "POST" }),
    updateProfile: (input: { displayName: string; age?: number | null; grade?: string | null; avatarIcon?: ChildProfile["avatar_icon"]; avatarColor?: string }) => request<{ user: AuthUser; profile: ChildProfile | Record<string, unknown> }>("/auth/profile", { method: "PUT", body: JSON.stringify(input) }),
  },
  dashboard: {
    today: () => request<TodaySnapshot>("/dashboard/today"),
    summary: () => request<DashboardSummary>("/dashboard"),
  },
  village: {
    state: () => request<VillageState>("/village/state"),
  },
  achievements: {
    list: () => request<Achievement[]>("/achievements"),
  },
  missions: {
    list: () => request<ParentChildMission[]>("/missions"),
    create: (input: { childId: number; title: string; description?: string; xpReward?: number }) => request<ParentChildMission>("/missions", { method: "POST", body: JSON.stringify(input) }),
    submit: (id: number) => request<ParentChildMission>(`/missions/${id}/submit`, { method: "PATCH" }),
    validate: (id: number) => request(`/missions/${id}/validate`, { method: "PATCH" }),
  },
  parent: {
    dashboard: () => request<{ parent: AuthUser; children: ParentChildSummary[] }>("/parent/dashboard"),
    children: () => request<ParentChildSummary[]>("/parent/children"),
  },
  habits: {
    list: () => request<Habit[]>("/habits"),
    create: (input: HabitInput) => request<Habit>("/habits", { method: "POST", body: JSON.stringify(input) }),
    update: (id: number, input: HabitInput) => request<Habit>(`/habits/${id}`, { method: "PUT", body: JSON.stringify(input) }),
    remove: (id: number) => request<void>(`/habits/${id}`, { method: "DELETE" }),
    log: (id: number, note = "") => request(`/habits/${id}/log`, { method: "POST", body: JSON.stringify({ note }) }),
    logs: (id: number) => request<Array<{ id: number; completed_on: string; is_completed: number; note: string }>>(`/habits/${id}/logs`),
  },
  quests: {
    list: (filter: "today" | "active" | "completed" | "all" = "all") => request<Quest[]>(`/quests?filter=${filter}`),
    create: (input: QuestInput) => request<Quest>("/quests", { method: "POST", body: JSON.stringify(input) }),
    update: (id: number, input: QuestInput) => request<Quest>(`/quests/${id}`, { method: "PUT", body: JSON.stringify(input) }),
    complete: (id: number) => request<Quest>(`/quests/${id}/complete`, { method: "PATCH" }),
    remove: (id: number) => request<void>(`/quests/${id}`, { method: "DELETE" }),
  },
  goals: {
    list: () => request<Array<{ id: number; title: string; category: string; status: string; progress: number }>>("/goals"),
    create: (input: GoalInput) => request("/goals", { method: "POST", body: JSON.stringify(input) }),
    update: (id: number, input: GoalInput) => request(`/goals/${id}`, { method: "PUT", body: JSON.stringify(input) }),
    complete: (id: number) => request(`/goals/${id}/complete`, { method: "PATCH" }),
    remove: (id: number) => request<void>(`/goals/${id}`, { method: "DELETE" }),
  },
  // goal detail helpers are appended below to keep the main block stable
  projects: {
    list: () => request<Array<{ id: number; title: string; status: string; risk_level: string }>>("/projects"),
    create: (input: ProjectInput) => request("/projects", { method: "POST", body: JSON.stringify(input) }),
  },
  reviews: {
    list: () => request<ReviewRecord[]>("/reviews"),
    create: (input: ReviewInput) => request<{ generatedSummary: ReviewSummary; progression: unknown | null }>("/reviews", { method: "POST", body: JSON.stringify(input) }),
  },
  discovery: {
    get: () => request<{ domains: DiscoveryDomain[]; challenges: DiscoveryChallenge[] }>("/discovery"),
    complete: (id: number) => request(`/discovery/challenges/${id}/complete`, { method: "PATCH" }),
  },
  focus: {
    get: () => request<{ weekStart: string; priorities: FocusPriority[]; challenges: WeeklyChallenge[] }>("/focus"),
    create: (input: { goalId?: number | null; projectId?: number | null; priorityType: "main" | "secondary" }) => request("/focus", { method: "POST", body: JSON.stringify(input) }),
    remove: (id: number) => request<void>(`/focus/${id}`, { method: "DELETE" }),
    createChallenge: (input: { title: string; description?: string; target: number }) => request("/focus/challenges", { method: "POST", body: JSON.stringify(input) }),
    updateChallenge: (id: number, progress: number) => request(`/focus/challenges/${id}/progress`, { method: "PATCH", body: JSON.stringify({ progress }) }),
  },
  lifeAreas: {
    list: () => request<LifeArea[]>("/life-areas"),
    update: (id: number, input: { score: number; trend: LifeArea["trend"] }) => request<LifeArea>(`/life-areas/${id}`, { method: "PUT", body: JSON.stringify(input) }),
  },
  campaigns: {
    get: () => request<{ campaign: { id: number; title: string; school_year: string; annual_goal: string } | null; chapters: CampaignChapter[] }>("/campaigns"),
    create: (input: { title: string; schoolYear: string; annualGoal: string }) => request("/campaigns", { method: "POST", body: JSON.stringify(input) }),
    updateChapter: (id: number, progress: number) => request(`/campaigns/chapters/${id}`, { method: "PATCH", body: JSON.stringify({ progress }) }),
    annualSummary: () => request<{ campaign: { id: number; title: string; school_year: string; annual_goal: string }; summary: { total_xp: number; completed_quests: number; habit_checkins: number; discoveries: number; parent_missions: number; best_streak: number }; chapters: CampaignChapter[] }>("/campaigns/annual-summary"),
  },
  insights: {
    get: () => request<{ xpTimeline: Array<{ day: string; xp: number }>; habitHeatmap: Array<{ day: string; completed: number }>; totals: { xp_30_days: number; quests_30_days: number; habits_30_days: number; best_streak: number }; notifications: Array<{ id: number; title: string; message: string; is_read: number }> }>("/insights"),
  },
  preferences: {
    get: () => request<{ onboarding_completed: number; habit_reminders: number; review_reminders: number; push_reminders: number }>("/preferences"),
    update: (input: { onboardingCompleted: boolean; habitReminders: boolean; reviewReminders: boolean; pushReminders: boolean }) => request("/preferences", { method: "PUT", body: JSON.stringify(input) }),
  },
  notifications: {
    list: () => request<{ notifications: NotificationRecord[]; unread: number }>("/notifications"),
    markRead: (id: number) => request<NotificationRecord>(`/notifications/${id}/read`, { method: "PATCH" }),
    markAllRead: () => request<void>("/notifications/read-all", { method: "PATCH" }),
  },
};

export interface HabitInput {
  name: string;
  description?: string;
  frequency?: "daily" | "weekly" | "custom";
  category: string;
  customSchedule?: string | null;
  goalId?: number | null;
}

export interface QuestInput {
  title: string;
  description?: string;
  dueDate?: string | null;
  priority?: "low" | "medium" | "high" | "critical";
  estimatedMinutes?: number | null;
  goalId?: number | null;
  projectId?: number | null;
}

export interface GoalInput {
  title: string;
  description?: string;
  category: string;
  priority?: "low" | "medium" | "high" | "critical";
  deadline?: string | null;
  status?: "not_started" | "in_progress" | "paused" | "completed";
  progress?: number;
  notes?: string;
}

export interface ProjectInput {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  riskLevel?: "low" | "medium" | "high";
  roadmap?: string;
  notes?: string;
  nextAction?: string;
}

export interface ReviewInput {
  reviewType: "weekly" | "monthly";
  periodStart: string;
  periodEnd: string;
  answersJson?: Record<string, unknown>;
  summaryJson?: Record<string, unknown>;
}

export interface MilestoneInput {
  title: string;
  description?: string;
  dueDate?: string | null;
  progress?: number;
  xpReward?: number;
}

export interface NoteInput {
  title: string;
  content?: string;
  noteType?: "reflection" | "action" | "idea" | "progress";
}

export const goalApi = {
  get: (id: number) => request<{ goal: { id: number; title: string; description: string; category: string; priority: string; deadline: string | null; status: string; progress: number; notes: string }; milestones: Array<{ id: number; title: string; description: string; due_date: string | null; progress: number; xp_reward: number }>; notes: Array<{ id: number; title: string; content: string; note_type: "reflection" | "action" | "idea" | "progress"; created_at: string; updated_at?: string | null }>; tasks: Quest[]; habits: Habit[] }>(`/goals/${id}`),
  addMilestone: (goalId: number, input: MilestoneInput) => request(`/goals/${goalId}/milestones`, { method: "POST", body: JSON.stringify(input) }),
  updateMilestone: (goalId: number, milestoneId: number, input: MilestoneInput) => request(`/goals/${goalId}/milestones/${milestoneId}`, { method: "PUT", body: JSON.stringify(input) }),
  removeMilestone: (goalId: number, milestoneId: number) => request<void>(`/goals/${goalId}/milestones/${milestoneId}`, { method: "DELETE" }),
  addNote: (goalId: number, input: NoteInput) => request(`/goals/${goalId}/notes`, { method: "POST", body: JSON.stringify(input) }),
  updateNote: (goalId: number, noteId: number, input: NoteInput) => request(`/goals/${goalId}/notes/${noteId}`, { method: "PUT", body: JSON.stringify(input) }),
  removeNote: (goalId: number, noteId: number) => request<void>(`/goals/${goalId}/notes/${noteId}`, { method: "DELETE" }),
};

export const projectApi = {
  get: (id: number) => request<{ project: ProjectRecord; milestones: ProjectMilestone[]; notes: ProjectNote[]; tasks: Quest[] }>(`/projects/${id}`),
  update: (id: number, input: ProjectInput) => request(`/projects/${id}`, { method: "PUT", body: JSON.stringify(input) }),
  remove: (id: number) => request<void>(`/projects/${id}`, { method: "DELETE" }),
  addMilestone: (id: number, input: MilestoneInput) => request(`/projects/${id}/milestones`, { method: "POST", body: JSON.stringify(input) }),
  updateMilestone: (projectId: number, milestoneId: number, input: MilestoneInput) => request(`/projects/${projectId}/milestones/${milestoneId}`, { method: "PUT", body: JSON.stringify(input) }),
  removeMilestone: (projectId: number, milestoneId: number) => request<void>(`/projects/${projectId}/milestones/${milestoneId}`, { method: "DELETE" }),
  addNote: (id: number, input: NoteInput) => request(`/projects/${id}/notes`, { method: "POST", body: JSON.stringify(input) }),
  updateNote: (projectId: number, noteId: number, input: NoteInput) => request(`/projects/${projectId}/notes/${noteId}`, { method: "PUT", body: JSON.stringify(input) }),
  removeNote: (projectId: number, noteId: number) => request<void>(`/projects/${projectId}/notes/${noteId}`, { method: "DELETE" }),
};
