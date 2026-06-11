import { Outlet } from "react-router-dom";

export function ImmersiveHomeLayout() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#4aaec4]">
      <Outlet />
    </main>
  );
}
