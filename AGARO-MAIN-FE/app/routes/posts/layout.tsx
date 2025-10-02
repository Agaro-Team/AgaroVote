import { Outlet } from "react-router";

export default function Layout() {
  return (
    <main className="flex justify-center pt-16 min-h-dvh px-4 md:px-0">
      <Outlet />
    </main>
  );
}
