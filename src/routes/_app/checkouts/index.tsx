import { createFileRoute } from "@tanstack/react-router";

import { CheckoutList, checkoutQueries } from "@/features/checkouts";
import { PageHeader } from "@/shared/ui/page-header";

export const Route = createFileRoute("/_app/checkouts/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(checkoutQueries.list()),
  component: CheckoutsPage,
});

function CheckoutsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Checkouts" description="Todos os checkouts da sua conta." />
      <CheckoutList />
    </div>
  );
}
