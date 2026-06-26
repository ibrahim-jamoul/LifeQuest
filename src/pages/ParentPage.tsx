import { CheckCircle2, Flame, HeartHandshake, Pencil, Plus, RotateCcw, Save, ShieldCheck, Target, TimerReset, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs } from "../components/Tabs";
import {
  DEFAULT_LIGHTHOUSE_RULES,
  LIGHTHOUSE_ATMOSPHERES,
  LIGHTHOUSE_HISTORY_KEY,
  LIGHTHOUSE_MODE_PRESETS,
  LIGHTHOUSE_RULES_KEY,
  type FocusHistoryEntry,
  type FocusRules,
  type TaskSource,
} from "../features/focus/lighthouseConfig";
import { readLighthouseJson, writeLighthouseJson } from "../features/focus/focusStorage";
import { api, type ParentChildMission, type ParentChildSummary } from "../lib/api/client";
import { useAppStore } from "../store";

const TASK_SOURCE_LABELS: Array<{ id: TaskSource; label: string; description: string }> = [
  { id: "workshop", label: "Workshop", description: "School tasks and practical work." },
  { id: "learning_corner", label: "Learning Corner", description: "Short study topics and revision." },
  { id: "garden", label: "Garden", description: "Routine and calm action prompts." },
  { id: "town_hall", label: "Town Hall", description: "Priority milestones and important steps." },
  { id: "custom", label: "Custom", description: "Let the child write a focus task manually." },
];

export function ParentPage() {
  const navigate = useNavigate();
  const returnToChild = useAppStore((state) => state.returnToChild);
  const [children, setChildren] = useState<ParentChildSummary[]>([]);
  const [missions, setMissions] = useState<ParentChildMission[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [focusRules, setFocusRules] = useState<FocusRules>(() => {
    const stored = readLighthouseJson<Partial<FocusRules>>(LIGHTHOUSE_RULES_KEY, {});
    const validAtmosphereIds = new Set(LIGHTHOUSE_ATMOSPHERES.map((item) => item.id));
    const filteredAtmospheres = stored.allowedAtmosphereIds?.filter((item) => validAtmosphereIds.has(item));
    return {
      ...DEFAULT_LIGHTHOUSE_RULES,
      ...stored,
      allowedTaskSources: stored.allowedTaskSources?.length ? stored.allowedTaskSources : DEFAULT_LIGHTHOUSE_RULES.allowedTaskSources,
      allowedAtmosphereIds: filteredAtmospheres?.length ? filteredAtmospheres : DEFAULT_LIGHTHOUSE_RULES.allowedAtmosphereIds,
    };
  });
  const [focusHistory, setFocusHistory] = useState<FocusHistoryEntry[]>(() => readLighthouseJson<FocusHistoryEntry[]>(LIGHTHOUSE_HISTORY_KEY, []));
  const [focusMessage, setFocusMessage] = useState<string | null>(null);
  const [durationHours, setDurationHours] = useState("0");
  const [durationMinutes, setDurationMinutes] = useState("15");
  const [editingDuration, setEditingDuration] = useState<number | null>(null);

  const durationPresetCount = focusRules.allowedDurations.length;
  const durationPresetTotal = (hoursRaw: string, minutesRaw: string) => {
    const hours = Math.max(0, Number(hoursRaw) || 0);
    const minutes = Math.max(0, Number(minutesRaw) || 0);
    return hours * 60 + minutes;
  };
  const resetDurationInputs = () => {
    setDurationHours("0");
    setDurationMinutes("15");
    setEditingDuration(null);
  };

  const load = async () => {
    try {
      const [dashboard, missionList] = await Promise.all([api.parent.dashboard(), api.missions.list()]);
      setChildren(dashboard.children);
      setMissions(missionList);
      setError(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load the parent lodge.");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const child = children[0];
  const toggleTaskSource = (source: TaskSource) => {
    setFocusRules((current) => ({
      ...current,
      allowedTaskSources: current.allowedTaskSources.includes(source)
        ? current.allowedTaskSources.filter((item) => item !== source)
        : [...current.allowedTaskSources, source],
    }));
  };
  const toggleAtmosphere = (atmosphereId: string) => {
    setFocusRules((current) => ({
      ...current,
      allowedAtmosphereIds: current.allowedAtmosphereIds.includes(atmosphereId)
        ? current.allowedAtmosphereIds.filter((item) => item !== atmosphereId)
        : [...current.allowedAtmosphereIds, atmosphereId],
    }));
  };
  const toggleBreakDuration = (value: number) => {
    setFocusRules((current) => {
      const next = current.allowedBreakDurations.includes(value)
        ? current.allowedBreakDurations.filter((item) => item !== value)
        : [...current.allowedBreakDurations, value];
      return { ...current, allowedBreakDurations: next.sort((a, b) => a - b) };
    });
  };
  const applyFocusPreset = (presetId: string) => {
    const preset = LIGHTHOUSE_MODE_PRESETS.find((item) => item.id === presetId);
    if (!preset) return;
    setFocusRules((current) => ({
      ...current,
      allowedDurations: Array.from(new Set([...current.allowedDurations, preset.duration])).sort((a, b) => a - b),
      allowedBreakDurations: Array.from(new Set([...current.allowedBreakDurations, preset.breakMinutes])).sort((a, b) => a - b),
      canPause: preset.canPause,
      canCancel: preset.canCancel,
      canFinishEarly: preset.canCancel,
      allowMultipleRounds: preset.rounds > 1,
      allowedAtmosphereIds: Array.from(new Set([...current.allowedAtmosphereIds, preset.atmosphereId])),
    }));
    setFocusMessage(`${preset.name} is ready to save.`);
  };
  const addOrUpdateDurationPreset = () => {
    const totalMinutes = durationPresetTotal(durationHours, durationMinutes);
    if (totalMinutes <= 0) {
      setFocusMessage("Duration preset must be longer than 0 minute.");
      return;
    }
    setFocusRules((current) => {
      const base = editingDuration === null
        ? [...current.allowedDurations, totalMinutes]
        : current.allowedDurations.map((value) => (value === editingDuration ? totalMinutes : value));
      const next = Array.from(new Set(base)).sort((a, b) => a - b);
      return { ...current, allowedDurations: next };
    });
    setFocusMessage(editingDuration === null ? "Duration preset added." : "Duration preset updated.");
    resetDurationInputs();
  };
  const startEditingDurationPreset = (value: number) => {
    setEditingDuration(value);
    setDurationHours(String(Math.floor(value / 60)));
    setDurationMinutes(String(value % 60));
    setFocusMessage(null);
  };
  const removeDurationPreset = (value: number) => {
    if (durationPresetCount <= 1) {
      setFocusMessage("At least one duration preset must stay available.");
      return;
    }
    setFocusRules((current) => ({
      ...current,
      allowedDurations: current.allowedDurations.filter((item) => item !== value),
    }));
    if (editingDuration === value) {
      resetDurationInputs();
    }
    setFocusMessage("Duration preset removed.");
  };
  const saveFocusRules = () => {
    const safeDurations = focusRules.allowedDurations.length ? focusRules.allowedDurations : DEFAULT_LIGHTHOUSE_RULES.allowedDurations;
    const safeBreaks = focusRules.allowedBreakDurations.length ? focusRules.allowedBreakDurations : DEFAULT_LIGHTHOUSE_RULES.allowedBreakDurations;
    const safeSources = focusRules.allowedTaskSources.length ? focusRules.allowedTaskSources : DEFAULT_LIGHTHOUSE_RULES.allowedTaskSources;
    const safeAtmospheres = focusRules.allowedAtmosphereIds.length ? focusRules.allowedAtmosphereIds : DEFAULT_LIGHTHOUSE_RULES.allowedAtmosphereIds;
    const nextRules = {
      ...focusRules,
      childId: child ? String(child.id) : focusRules.childId,
      allowedDurations: Array.from(new Set(safeDurations)).sort((a, b) => a - b),
      allowedBreakDurations: safeBreaks,
      allowedTaskSources: safeSources,
      allowedAtmosphereIds: safeAtmospheres,
    };
    setFocusRules(nextRules);
    writeLighthouseJson(LIGHTHOUSE_RULES_KEY, nextRules);
    setFocusMessage("Lighthouse settings saved.");
  };
  const resetFocusRules = () => {
    const nextRules = { ...DEFAULT_LIGHTHOUSE_RULES, childId: child ? String(child.id) : "" };
    setFocusRules(nextRules);
    writeLighthouseJson(LIGHTHOUSE_RULES_KEY, nextRules);
    setFocusMessage("Lighthouse settings reset to default.");
  };
  const clearFocusHistory = () => {
    setFocusHistory([]);
    writeLighthouseJson(LIGHTHOUSE_HISTORY_KEY, []);
    setFocusMessage("Lighthouse history cleared.");
  };

  return (
    <div className="space-y-6">
      <section className="page-hero">
        <p className="eyebrow">Support without micromanaging</p>
        <h1 className="mt-2 text-4xl font-black text-text-primary">Parent lodge</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">Follow progress, create shared missions, and validate real moments completed together.</p>
      </section>

      <button className="button-secondary md:w-fit" onClick={async () => { await returnToChild(); navigate("/", { replace: true }); }}><RotateCcw className="size-4" />Return to child account</button>
      {error ? <section className="rounded-2xl border-2 border-border bg-danger-bg p-4 text-sm font-bold text-danger">{error}</section> : null}
      {focusMessage ? <section className="rounded-2xl border-2 border-border bg-cream-secondary p-4 text-sm font-bold text-text-primary">{focusMessage}</section> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="panel p-5"><p className="eyebrow">Child</p><strong className="mt-2 block text-2xl text-text-primary">{child?.display_name ?? "No linked child"}</strong><p className="mt-1 text-sm text-text-secondary">{child ? `${child.grade} - Level ${child.level}` : "Link required"}</p></div>
        <div className="panel p-5"><p className="eyebrow">XP</p><strong className="mt-2 block text-2xl text-text-primary">{child?.total_xp ?? 0}</strong><Flame className="mt-2 size-5 text-accent" /></div>
        <div className="panel p-5"><p className="eyebrow">Completed quests</p><strong className="mt-2 block text-2xl text-text-primary">{child?.completedQuests ?? 0}</strong><CheckCircle2 className="mt-2 size-5 text-primary" /></div>
        <div className="panel p-5"><p className="eyebrow">Pending together</p><strong className="mt-2 block text-2xl text-text-primary">{child?.pendingMissions ?? 0}</strong><HeartHandshake className="mt-2 size-5 text-text-secondary" /></div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
        <form className="panel p-5" onSubmit={async (event) => {
          event.preventDefault();
          if (!child) return;
          setSaving(true);
          try {
            await api.missions.create({ childId: child.id, title, description });
            setTitle("");
            setDescription("");
            await load();
          } finally {
            setSaving(false);
          }
        }}>
          <h2 className="text-lg font-black text-text-primary">Create a shared mission</h2>
          <div className="mt-4 space-y-3">
            <input className="input" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Mission title" required />
            <textarea className="input" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What will you do together?" rows={5} />
            <button className="button-primary" type="submit" disabled={saving || !child}><Plus className="size-4" />{saving ? "Creating..." : "Create mission"}</button>
          </div>
        </form>
        <div className="panel p-5">
          <h2 className="text-lg font-black text-text-primary">Missions to validate</h2>
          <div className="mt-4 space-y-3">
            {missions.length === 0 ? <p className="text-sm text-text-secondary">No mission yet.</p> : missions.map((mission) => (
              <article key={mission.id} className="rounded-cozy-lg border-2 border-border bg-cream-light p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div><h3 className="font-black text-text-primary">{mission.title}</h3><p className="mt-1 text-sm text-text-secondary">{mission.description}</p></div>
                  {mission.status === "child_submitted" ? <button className="button-primary md:w-fit" onClick={async () => { await api.missions.validate(mission.id); await load(); }}><ShieldCheck className="size-4" />Validate</button> : <span className="pill"><Target className="size-4" />{mission.status === "pending" ? "Waiting for child" : "Completed"}</span>}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="panel p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="eyebrow">Lighthouse control</p>
            <h2 className="mt-2 text-2xl font-black text-text-primary">Parent panel</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">Configure how the immersive Lighthouse behaves for the child: focus length, allowed exits, source gates, atmospheres, and saved sessions.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="button-secondary" onClick={resetFocusRules}><TimerReset className="size-4" />Reset defaults</button>
            <button className="button-primary" onClick={saveFocusRules}><Save className="size-4" />Save Lighthouse</button>
          </div>
        </div>

        <div className="mt-5">
          <Tabs
            defaultTab="focus-modes"
            tabs={[
              {
                id: "focus-modes",
                label: "Focus Modes",
                content: (
                  <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                    {LIGHTHOUSE_MODE_PRESETS.map((preset) => (
                      <article key={preset.id} className="rounded-cozy-lg border-2 border-border bg-cream-light p-4">
                        <p className="eyebrow">{preset.name}</p>
                        <strong className="mt-2 block text-lg text-text-primary">{preset.duration} min focus</strong>
                        <p className="mt-2 text-sm text-text-secondary">{preset.breakMinutes ? `${preset.breakMinutes} min break` : "No break"} - {preset.rounds} round{preset.rounds > 1 ? "s" : ""}</p>
                        <p className="mt-1 text-sm text-text-secondary">{preset.canPause ? "Pause allowed" : "Pause locked"} - {preset.canCancel ? "Exit allowed" : "Exit locked"}</p>
                        <button className="button-secondary mt-4" onClick={() => applyFocusPreset(preset.id)}>Use preset</button>
                      </article>
                    ))}
                  </div>
                ),
              },
              {
                id: "rules",
                label: "Rules",
                content: (
                  <div className="grid gap-5 lg:grid-cols-2">
                    <section className="rounded-cozy-lg border-2 border-border bg-cream-light p-4">
                      <h3 className="text-lg font-black text-text-primary">Allowed durations</h3>
                      <div className="mt-3 space-y-3">
                        {focusRules.allowedDurations.map((value) => (
                          <div key={value} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-cream-secondary p-3">
                            <div>
                              <strong className="block text-sm text-text-primary">
                                {value >= 60 ? `${Math.floor(value / 60)}h ${value % 60}m` : `${value} min`}
                              </strong>
                              <span className="text-xs text-text-secondary">{value} total minutes</span>
                            </div>
                            <div className="flex gap-2">
                              <button className="button-secondary min-h-0 px-3 py-2" onClick={() => startEditingDurationPreset(value)}>
                                <Pencil className="size-4" />
                              </button>
                              <button className="button-secondary min-h-0 px-3 py-2" disabled={durationPresetCount <= 1} onClick={() => removeDurationPreset(value)}>
                                <Trash2 className="size-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-[.7fr_.7fr_auto_auto]">
                        <label className="text-sm font-bold text-text-primary">
                          Hours
                          <input className="input mt-2" type="number" min={0} max={12} value={durationHours} onChange={(event) => setDurationHours(event.target.value)} />
                        </label>
                        <label className="text-sm font-bold text-text-primary">
                          Minutes
                          <input className="input mt-2" type="number" min={0} max={59} value={durationMinutes} onChange={(event) => setDurationMinutes(event.target.value)} />
                        </label>
                        <button className="button-primary self-end" onClick={addOrUpdateDurationPreset}>
                          {editingDuration === null ? <Plus className="size-4" /> : <Save className="size-4" />}
                          {editingDuration === null ? "Add" : "Update"}
                        </button>
                        {editingDuration !== null ? (
                          <button className="button-secondary self-end" onClick={resetDurationInputs}>
                            Cancel
                          </button>
                        ) : null}
                      </div>
                      <h3 className="mt-5 text-lg font-black text-text-primary">Allowed breaks</h3>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {[0, 3, 5, 10].map((value) => (
                          <button key={value} className={focusRules.allowedBreakDurations.includes(value) ? "button-primary" : "button-secondary"} onClick={() => toggleBreakDuration(value)}>{value === 0 ? "No break" : `${value} min`}</button>
                        ))}
                      </div>
                    </section>

                    <section className="rounded-cozy-lg border-2 border-border bg-cream-light p-4">
                      <h3 className="text-lg font-black text-text-primary">Guard rails</h3>
                      <label className="mt-3 block text-sm font-bold text-text-primary">Max daily focus minutes
                        <input className="input mt-2" type="number" min={0} max={240} value={focusRules.maxDailyFocusMinutes} onChange={(event) => setFocusRules((current) => ({ ...current, maxDailyFocusMinutes: Number(event.target.value) || 0 }))} />
                        <span className="mt-2 block text-xs font-medium text-text-secondary">Use `0` to remove the daily cap.</span>
                      </label>
                      <label className="mt-4 block text-sm font-bold text-text-primary">Approval above
                        <select className="input mt-2" value={focusRules.requireParentApprovalAboveMinutes} onChange={(event) => setFocusRules((current) => ({ ...current, requireParentApprovalAboveMinutes: Number(event.target.value) }))}>
                          <option value={0}>No approval gate</option>
                          {[10, 15, 20, 25, 40, 60].map((value) => <option key={value} value={value}>{value} min</option>)}
                        </select>
                      </label>
                      <div className="mt-4 space-y-3">
                        <label className="flex items-center justify-between rounded-2xl bg-cream-secondary p-3"><span className="text-sm font-bold text-text-primary">Pause allowed</span><input type="checkbox" checked={focusRules.canPause} onChange={(event) => setFocusRules((current) => ({ ...current, canPause: event.target.checked }))} /></label>
                        <label className="flex items-center justify-between rounded-2xl bg-cream-secondary p-3"><span className="text-sm font-bold text-text-primary">Cancel allowed</span><input type="checkbox" checked={focusRules.canCancel} onChange={(event) => setFocusRules((current) => ({ ...current, canCancel: event.target.checked }))} /></label>
                        <label className="flex items-center justify-between rounded-2xl bg-cream-secondary p-3"><span className="text-sm font-bold text-text-primary">Finish early allowed</span><input type="checkbox" checked={focusRules.canFinishEarly} onChange={(event) => setFocusRules((current) => ({ ...current, canFinishEarly: event.target.checked }))} /></label>
                        <label className="flex items-center justify-between rounded-2xl bg-cream-secondary p-3"><span className="text-sm font-bold text-text-primary">Multiple rounds allowed</span><input type="checkbox" checked={focusRules.allowMultipleRounds} onChange={(event) => setFocusRules((current) => ({ ...current, allowMultipleRounds: event.target.checked }))} /></label>
                        <label className="flex items-center justify-between rounded-2xl bg-cream-secondary p-3"><span className="text-sm font-bold text-text-primary">Custom task allowed</span><input type="checkbox" checked={focusRules.canUseCustomTask} onChange={(event) => setFocusRules((current) => ({ ...current, canUseCustomTask: event.target.checked }))} /></label>
                      </div>
                    </section>
                  </div>
                ),
              },
              {
                id: "allowed-tasks",
                label: "Allowed Tasks",
                content: (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {TASK_SOURCE_LABELS.map((source) => (
                      <article key={source.id} className="rounded-cozy-lg border-2 border-border bg-cream-light p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <strong className="block text-text-primary">{source.label}</strong>
                            <p className="mt-2 text-sm text-text-secondary">{source.description}</p>
                          </div>
                          <input type="checkbox" checked={focusRules.allowedTaskSources.includes(source.id)} onChange={() => toggleTaskSource(source.id)} />
                        </div>
                      </article>
                    ))}
                  </div>
                ),
              },
              {
                id: "atmospheres",
                label: "Atmospheres",
                content: (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {LIGHTHOUSE_ATMOSPHERES.map((atmosphere) => (
                      <article key={atmosphere.id} className="rounded-cozy-lg border-2 border-border bg-cream-light p-4">
                        <div className="h-20 rounded-2xl border border-border" style={{ background: atmosphere.background }} />
                        <div className="mt-4 flex items-start justify-between gap-3">
                          <div>
                            <strong className="block text-text-primary">{atmosphere.name}</strong>
                            <p className="mt-2 text-sm text-text-secondary">{atmosphere.subtitle}</p>
                          </div>
                          <input type="checkbox" checked={focusRules.allowedAtmosphereIds.includes(atmosphere.id)} onChange={() => toggleAtmosphere(atmosphere.id)} />
                        </div>
                      </article>
                    ))}
                  </div>
                ),
              },
              {
                id: "device",
                label: "Device",
                content: (
                  <div className="grid gap-4 lg:grid-cols-2">
                    <article className="rounded-cozy-lg border-2 border-border bg-cream-light p-4">
                      <strong className="block text-text-primary">Current MVP behavior</strong>
                      <p className="mt-2 text-sm leading-6 text-text-secondary">The Lighthouse hides normal navigation, opens full-screen, and keeps the child inside LifeQuest during active focus.</p>
                    </article>
                    <article className="rounded-cozy-lg border-2 border-border bg-cream-light p-4">
                      <strong className="block text-text-primary">Future native controls</strong>
                      <p className="mt-2 text-sm leading-6 text-text-secondary">System notifications, tablet focus mode, and device-level blocking are still future work. This panel only controls the in-app Lighthouse for now.</p>
                    </article>
                  </div>
                ),
              },
              {
                id: "history",
                label: "History",
                content: (
                  <div className="space-y-4">
                    <div className="flex flex-wrap justify-between gap-3">
                      <p className="text-sm text-text-secondary">Recent Lighthouse sessions saved on this device for the current child flow.</p>
                      <button className="button-secondary" onClick={clearFocusHistory}>Clear history</button>
                    </div>
                    <div className="space-y-3">
                      {focusHistory.length === 0 ? <p className="rounded-cozy-lg border-2 border-border bg-cream-light p-4 text-sm text-text-secondary">No Lighthouse session saved yet.</p> : focusHistory.map((entry) => (
                        <article key={entry.id} className="rounded-cozy-lg border-2 border-border bg-cream-light p-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <strong className="block text-text-primary">{entry.taskTitle}</strong>
                              <p className="mt-1 text-sm text-text-secondary">{entry.durationMinutes} min - {entry.rounds} round{entry.rounds > 1 ? "s" : ""} - {entry.completed ? "Completed" : "Stopped early"}</p>
                            </div>
                            <span className="pill">{new Date(entry.createdAt).toLocaleDateString()}</span>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                ),
              },
            ]}
          />
        </div>
      </section>
    </div>
  );
}

