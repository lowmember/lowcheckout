import { useState } from "react";

import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";
import { useOrders } from "@/features/orders/hooks/use-orders";
import type { OrderStatus } from "@/features/orders/types/order";
import { formatCurrency } from "@/shared/lib/format-currency";
import { formatDateTime } from "@/shared/lib/format-date";
import { Card } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { SalesIcon } from "@/shared/ui/icons";
import { SegmentedControl } from "@/shared/ui/segmented-control";
import { Skeleton } from "@/shared/ui/skeleton";

type StatusFilter = OrderStatus | "all";

const FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "paid", label: "Aprovadas" },
  { value: "awaiting_payment", label: "Pendentes" },
  { value: "expired", label: "Expiradas" },
];

/** CPF nunca aparece inteiro em listagem (LGPD). */
function maskDocument(document: string) {
  if (document.length < 5) return "•••";
  return `•••.${document.slice(3, 6)}.•••-••`;
}

export function OrderList() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const { orders, isLoadingOrders, hasOrdersError } = useOrders(
    statusFilter === "all" ? {} : { status: statusFilter },
  );

  return (
    <div className="space-y-4">
      <SegmentedControl
        options={FILTER_OPTIONS}
        value={statusFilter}
        onChange={setStatusFilter}
        ariaLabel="Filtrar vendas por status"
      />

      {isLoadingOrders && (
        <Card className="divide-y divide-neutral-200">
          {[0, 1, 2].map((index) => (
            <div key={index} className="space-y-2 px-5 py-4">
              <Skeleton className="h-3.5 w-64" />
              <Skeleton className="h-3 w-40" />
            </div>
          ))}
        </Card>
      )}

      {hasOrdersError && !isLoadingOrders && (
        <EmptyState
          icon={<SalesIcon className="size-5" />}
          title="Nenhuma venda para mostrar"
          description="A listagem de pedidos ainda não tem endpoint na API. A tela já está pronta para consumi-lo assim que existir."
        />
      )}

      {!isLoadingOrders && !hasOrdersError && orders.length === 0 && (
        <EmptyState
          icon={<SalesIcon className="size-5" />}
          title="Nenhuma venda ainda"
          description="Assim que um comprador pagar um PIX, o pedido aparece aqui com valor, comprador e status."
        />
      )}

      {orders.length > 0 && (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-neutral-200 border-b text-left">
                <th className="px-5 py-3 font-medium text-neutral-500 text-xs">Comprador</th>
                <th className="px-5 py-3 font-medium text-neutral-500 text-xs">Produto</th>
                <th className="px-5 py-3 font-medium text-neutral-500 text-xs">Valor</th>
                <th className="px-5 py-3 font-medium text-neutral-500 text-xs">Status</th>
                <th className="px-5 py-3 font-medium text-neutral-500 text-xs">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {orders.map((order) => (
                <tr key={order.id} className="transition-colors hover:bg-neutral-50">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-neutral-900">{order.buyerName}</p>
                    <p className="text-neutral-500 text-xs">
                      {order.buyerEmail} · {maskDocument(order.buyerDocument)}
                    </p>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-neutral-700">{order.productNameSnapshot}</p>
                    <p className="text-neutral-500 text-xs">{order.offerNameSnapshot}</p>
                  </td>
                  <td className="px-5 py-3.5 font-medium text-neutral-900 tabular-nums">
                    {formatCurrency(order.amountInCents, order.currency)}
                  </td>
                  <td className="px-5 py-3.5">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-neutral-500 text-xs">
                    {formatDateTime(order.paidAt ?? order.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
