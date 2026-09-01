import { queryOptions } from "@tanstack/react-query";

import {
  getPublicCheckout,
  getPublicOrder,
  getPublicOrderStatus,
} from "@/features/checkout/api/public-checkout.api";

export const publicCheckoutKeys = {
  all: ["public-checkout"] as const,
  detail: (publicSlug: string) => [...publicCheckoutKeys.all, "detail", publicSlug] as const,
  order: (orderId: string) => [...publicCheckoutKeys.all, "order", orderId] as const,
  orderStatus: (orderId: string) =>
    [...publicCheckoutKeys.all, "order", orderId, "status"] as const,
};

/** Intervalo do polling do PIX: o suficiente para parecer instantâneo sem martelar a API. */
const ORDER_STATUS_POLL_MS = 5000;

export const publicCheckoutQueries = {
  detail: (publicSlug: string, visitorId: string | null) =>
    queryOptions({
      queryKey: publicCheckoutKeys.detail(publicSlug),
      queryFn: () => getPublicCheckout(publicSlug, visitorId),
      /*
       * O checkout não muda no meio de uma compra, e cada refetch dispara outro
       * `page_view` no funil (RF-PUB-08). Uma leitura por sessão é o certo aqui.
       */
      staleTime: Number.POSITIVE_INFINITY,
      retry: 1,
    }),

  /** Documento completo do pedido: QR Code na criação, `deliveryUrl` quando pago. */
  order: (orderId: string) =>
    queryOptions({
      queryKey: publicCheckoutKeys.order(orderId),
      queryFn: () => getPublicOrder(orderId),
      staleTime: 0,
    }),

  /**
   * Só o status, em laço. É a rota enxuta de propósito: o comprador fica nesta
   * tela por minutos, e repetir o pedido inteiro a cada cinco segundos gastaria
   * banda dele para reconfirmar campos que não mudam.
   */
  orderStatus: (orderId: string) =>
    queryOptions({
      queryKey: publicCheckoutKeys.orderStatus(orderId),
      queryFn: () => getPublicOrderStatus(orderId),
      refetchInterval: (query) =>
        query.state.data?.status === "awaiting_payment" ? ORDER_STATUS_POLL_MS : false,
      staleTime: 0,
    }),
};
