import { useQuery } from "@tanstack/react-query";

import { orderQueries } from "@/features/orders/api/orders.queries";
import type { ListOrdersParams } from "@/features/orders/types/order";

export function useOrders(params: ListOrdersParams = {}) {
  const { data, isLoading, isError } = useQuery(orderQueries.list(params));

  return {
    orders: data?.data ?? [],
    ordersMeta: data?.meta,
    isLoadingOrders: isLoading,
    hasOrdersError: isError,
  };
}
