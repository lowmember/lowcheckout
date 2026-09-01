import { createFileRoute } from "@tanstack/react-router";

import { GatewayList, gatewayQueries } from "@/features/gateway";
import { PageHeader } from "@/shared/ui/page-header";

export const Route = createFileRoute("/_app/gateways/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(gatewayQueries.connection()).catch(() => null),
  component: GatewaysPage,
});

function GatewaysPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Gateways"
        description="O gateway é configurado uma vez por conta e vale para todos os checkouts."
      />

      <GatewayList />
    </div>
  );
}
