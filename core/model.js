export const STORAGE_KEY = 'lifequest-v3-portrait-demo-v1';
export const STORAGE_VERSION = 2;

export const FOCUS_TASKS = Object.freeze([
  { id: 'lesson', label: 'Réviser une notion', icon: '✎' },
  { id: 'reading', label: 'Lire au calme', icon: '◫' },
  { id: 'homework', label: 'Faire mes devoirs', icon: '✓' },
]);

export const FOCUS_DURATIONS = Object.freeze([60, 180, 300]);

export function freshDatabase() {
  return {
    version: STORAGE_VERSION,
    profiles: [],
    activeId: null,
    settings: { sound: true, reducedMotion: false },
  };
}

const asObject = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
const asPositiveInteger = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed) : fallback;
};

function normalizeProgress(raw) {
  const progress = {};
  for (const [id, value] of Object.entries(asObject(raw))) {
    if (!/^[A-Z]{3}-\d{2}$/.test(id)) continue;
    const state = asObject(value);
    progress[id] = {
      quizDone: state.quizDone === true,
      gameDone: state.gameDone === true,
      done: state.done === true,
    };
  }
  return progress;
}

function normalizeWatched(raw) {
  return Object.fromEntries(
    Object.entries(asObject(raw))
      .filter(([id, watched]) => /^[A-Z]{3}-\d{2}$/.test(id) && watched === true),
  );
}

function normalizeFocusSessions(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(item => item && typeof item === 'object')
    .map(item => ({
      duration: asPositiveInteger(item.duration),
      task: String(item.task || 'Session de concentration').slice(0, 60),
      finishedAt: Number.isNaN(Date.parse(item.finishedAt)) ? new Date(0).toISOString() : item.finishedAt,
    }))
    .filter(item => item.duration > 0)
    .slice(-30);
}

function normalizeFocusDraft(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const total = asPositiveInteger(raw.total, 60);
  const left = Math.min(total, asPositiveInteger(raw.left, total));
  if (!total || !left) return null;
  const endAt = Number(raw.endAt);
  const validEndAt = Number.isFinite(endAt) && endAt > 0 ? endAt : null;
  return {
    task: String(raw.task || FOCUS_TASKS[0].label).slice(0, 60),
    total,
    left,
    running: raw.running === true && validEndAt !== null,
    endAt: validEndAt,
  };
}

export function normalizeProfile(raw, index = 0) {
  const profile = asObject(raw);
  const id = String(profile.id || `profil-${index + 1}`);
  return {
    id,
    name: String(profile.name || 'Explorateur').trim().slice(0, 22) || 'Explorateur',
    avatar: Math.min(3, Math.max(0, asPositiveInteger(profile.avatar))),
    introSeen: profile.introSeen === true,
    watched: normalizeWatched(profile.watched),
    progress: normalizeProgress(profile.progress),
    points: asPositiveInteger(profile.points),
    focusSessions: normalizeFocusSessions(profile.focusSessions),
    focusDraft: normalizeFocusDraft(profile.focusDraft),
  };
}

export function normalizeDatabase(raw) {
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.profiles)) return freshDatabase();
  const profiles = raw.profiles.map(normalizeProfile);
  const requestedActiveId = raw.activeId == null ? null : String(raw.activeId);
  return {
    ...freshDatabase(),
    profiles,
    activeId: profiles.some(profile => profile.id === requestedActiveId) ? requestedActiveId : null,
    settings: { ...freshDatabase().settings, ...asObject(raw.settings) },
  };
}

export function completedNotions(profile) {
  return Object.values(profile?.progress || {}).filter(value => value?.done).length;
}

export function watchedLessons(profile) {
  return Object.values(profile?.watched || {}).filter(Boolean).length;
}

export function focusStats(profile) {
  const sessions = Array.isArray(profile?.focusSessions) ? profile.focusSessions : [];
  return {
    sessions: sessions.length,
    seconds: sessions.reduce((total, session) => total + asPositiveInteger(session.duration), 0),
  };
}

export function focusRemainingSeconds(draft, now = Date.now()) {
  if (!draft) return 0;
  if (draft.running && Number.isFinite(draft.endAt)) {
    return Math.max(0, Math.ceil((draft.endAt - now) / 1000));
  }
  return Math.max(0, asPositiveInteger(draft.left));
}

export function rewardMetrics(profile) {
  return {
    notions: completedNotions(profile),
    lessons: watchedLessons(profile),
    focusSessions: focusStats(profile).sessions,
  };
}

export function rewardStatus(reward, profile) {
  const current = rewardMetrics(profile)[reward.metric] || 0;
  const need = Math.max(1, asPositiveInteger(reward.need, 1));
  return {
    current,
    need,
    earned: reward.kind === 'virtual' && current >= need,
    ratio: Math.min(1, current / need),
  };
}
