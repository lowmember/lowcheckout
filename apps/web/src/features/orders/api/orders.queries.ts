import { queryOptions } from "@tanstack/react-query";

import { listOrders } from "@/features/orders/api/orders.api";
import type { ListOrdersParams } from "@/features/orders/types/order";

export const orderKeys = {
  all: ["orders"] as const,
  lists: () => [...orderKeys.all, "list"] as const,
  list: (params: ListOrdersParams) => [...orderKeys.lists(), params] as const,
};

export const orderQueries = {
  list: (params: ListOrdersParams = {}) =>
    queryOptions({
      queryKey: orderKeys.list(params),
      queryFn: () => listOrders(params),
      retry: false,
    }),
};
