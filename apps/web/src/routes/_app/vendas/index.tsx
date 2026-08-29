import { createFileRoute } from "@tanstack/react-router";

import { OrderList, orderQueries } from "@/features/orders";
import { PageHeader } from "@/shared/ui/page-header";

export const Route = createFileRoute("/_app/vendas/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(orderQueries.list()).catch(() => null),
  component: OrdersPage,
});

function OrdersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendas"
        description="Todos os pedidos da conta, com valor, comprador e status do PIX."
      />

      <OrderList />
    </div>
  );
}
