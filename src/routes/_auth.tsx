import { createFileRoute, Outlet } from "@tanstack/react-router";

import { Logo } from "@/shared/ui/logo";

export const Route = createFileRoute("/_auth")({
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 px-6 py-10 text-neutral-900">
      <Logo className="self-center" />

      <main className="mx-auto mt-14 w-full max-w-[380px] pb-16">
        <Outlet />
      </main>
    </div>
  );
}
