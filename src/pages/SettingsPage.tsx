import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../lib/api/client";

export function SettingsPage() {
  const [habitReminders, setHabitReminders] = useState(true);
  const [reviewReminders, setReviewReminders] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { void api.preferences.get().then((value) => { setHabitReminders(Boolean(value.habit_reminders)); setReviewReminders(Boolean(value.review_reminders)); setOnboardingCompleted(Boolean(value.onboarding_completed)); }).catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load settings.")); }, []);
  return <div className="space-y-6"><section className="page-hero"><p className="eyebrow">Application</p><h1 className="mt-2 text-3xl font-black text-[#5a4632]">Settings</h1><p className="mt-2 text-sm text-[#7a6652]">Configure reminders and the guided village introduction.</p></section>{message ? <div className="rounded-2xl bg-[#edf7e9] p-4 text-sm font-bold text-[#47783b]">{message}</div> : null}{error ? <div className="rounded-2xl bg-[#ffe0da] p-4 text-sm font-bold text-[#7a2626]">{error}</div> : null}<section className="panel max-w-3xl space-y-4 p-6">
    <label className="flex items-center justify-between rounded-2xl bg-[#fffdf7] p-4"><span><strong className="block text-[#5a4632]">Habit reminders</strong><small className="text-[#7a6652]">Show a local reminder when habits remain unchecked.</small></span><input type="checkbox" checked={habitReminders} onChange={(event) => setHabitReminders(event.target.checked)} /></label>
    <label className="flex items-center justify-between rounded-2xl bg-[#fffdf7] p-4"><span><strong className="block text-[#5a4632]">Weekly review reminders</strong><small className="text-[#7a6652]">Remind me when this week's review is missing.</small></span><input type="checkbox" checked={reviewReminders} onChange={(event) => setReviewReminders(event.target.checked)} /></label>
    <button className="button-secondary" onClick={() => setOnboardingCompleted(false)}>Show onboarding again</button>
    <button className="button-primary" onClick={async () => { try { await api.preferences.update({ onboardingCompleted, habitReminders, reviewReminders }); setMessage("Settings saved."); setError(null); } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to save settings."); } }}><Save className="size-4" />Save settings</button>
  </section></div>;
}
