import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <nav className="border-neutral-200 border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-6 px-6 py-4">
          <span className="font-semibold">LowCheckout</span>
          <Link to="/" className="text-neutral-600 text-sm hover:text-neutral-900">
            Início
          </Link>
          <Link to="/checkouts" className="text-neutral-600 text-sm hover:text-neutral-900">
            Checkouts
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
