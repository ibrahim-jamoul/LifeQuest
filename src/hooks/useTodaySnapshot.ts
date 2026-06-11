import { useEffect } from "react";
import { useAppStore } from "../store";

export function useTodaySnapshot() {
  const snapshot = useAppStore((state) => state.todaySnapshot);
  const refreshToday = useAppStore((state) => state.refreshToday);
  useEffect(() => {
    void refreshToday();
  }, [refreshToday]);
  return snapshot;
}
