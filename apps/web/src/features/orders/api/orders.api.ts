import type { ListOrdersParams, Order } from "@/features/orders/types/order";
import { httpClient } from "@/shared/api/http-client";
import type { PaginatedResponse } from "@/shared/api/types";

/** Listagem de pedidos da conta — envelope paginado padrão, `created_at` desc. */
export async function listOrders(params: ListOrdersParams = {}) {
  const response = await httpClient.get<PaginatedResponse<Order>>("/orders", { params });
  return response.data;
}
