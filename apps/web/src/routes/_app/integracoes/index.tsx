import { createFileRoute, Link } from "@tanstack/react-router";

import { GatewayPanel, gatewayQueries } from "@/features/gateway";
import { Card, CardBody, CardHeader } from "@/shared/ui/card";
import { ChevronRightIcon } from "@/shared/ui/icons";
import { PageHeader } from "@/shared/ui/page-header";

export const Route = createFileRoute("/_app/integracoes/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(gatewayQueries.connection()).catch(() => null),
  component: IntegrationsPage,
});

function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Integrações"
        description="O gateway é configurado uma vez por conta e vale para todos os checkouts."
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <GatewayPanel />

        <Card className="self-start">
          <CardHeader title="Pixels de rastreamento" />
          <CardBody>
            <p className="text-neutral-500 text-sm leading-relaxed">
              Facebook e Utmify são configurados <strong>dentro de cada checkout</strong>, porque
              cada checkout costuma ser uma campanha diferente.
            </p>

            <Link
              to="/checkouts"
              className="group mt-4 flex items-center justify-between gap-2 rounded-lg border border-neutral-200 px-3.5 py-2.5 font-medium text-neutral-700 text-sm transition-colors hover:border-neutral-300 hover:bg-neutral-50"
            >
              Ir para checkouts
              <ChevronRightIcon className="size-4 text-neutral-400 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
