import { createFileRoute, Outlet } from "@tanstack/react-router";

import { requireCompletedOnboarding } from "@/features/auth";

/**
 * Layout do builder: mesmas garantias de sessão do painel, sem a navegação
 * lateral. O editor visual precisa da tela inteira.
 */
export const Route = createFileRoute("/_builder")({
  beforeLoad: () => {
    requireCompletedOnboarding();
  },
  component: BuilderLayout,
});

function BuilderLayout() {
  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <Outlet />
    </div>
  );
}
