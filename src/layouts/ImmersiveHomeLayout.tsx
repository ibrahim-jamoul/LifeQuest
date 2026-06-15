import { Outlet } from "react-router-dom";

export function ImmersiveHomeLayout() {
  return (
    <main className="min-h-screen overflow-hidden bg-ocean">
      <Outlet />
    </main>
  );
}
