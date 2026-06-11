import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppStore } from "../store";
import type { UserRole } from "../lib/api/client";

function Guard({ role }: { role?: UserRole }) {
  const location = useLocation();
  const bootstrap = useAppStore((state) => state.bootstrap);
  const ready = useAppStore((state) => state.ready);
  const user = useAppStore((state) => state.user);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  if (!ready) {
    return <main className="grid min-h-screen place-items-center bg-[#dff0e8] text-sm font-bold text-[#5a4632]">Loading your village...</main>;
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (role && user.role !== role) {
    return <Navigate to={user.role === "parent" ? "/parent" : "/"} replace />;
  }
  return <Outlet />;
}

export function RequireAuth() {
  return <Guard />;
}

export function RequireChild() {
  return <Guard role="child" />;
}

export function RequireParent() {
  return <Guard role="parent" />;
}
