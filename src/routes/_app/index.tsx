import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="space-y-2">
      <h1 className="font-semibold text-2xl">Gerenciamento de checkouts</h1>
      <p className="text-neutral-600">Use o menu para navegar até a listagem de checkouts.</p>
    </div>
  );
}
