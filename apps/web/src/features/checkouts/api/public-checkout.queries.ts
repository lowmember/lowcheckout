import { queryOptions } from "@tanstack/react-query";

import { getPixOrder, getPublicCheckout } from "@/features/checkouts/api/public-checkout.api";

export const publicCheckoutKeys = {
  all: ["public-checkout"] as const,
  details: () => [...publicCheckoutKeys.all, "detail"] as const,
  detail: (publicSlug: string) => [...publicCheckoutKeys.details(), publicSlug] as const,
  orders: () => [...publicCheckoutKeys.all, "order"] as const,
  order: (orderId: string) => [...publicCheckoutKeys.orders(), orderId] as const,
};

export const publicCheckoutQueries = {
  detail: (publicSlug: string) =>
    queryOptions({
      queryKey: publicCheckoutKeys.detail(publicSlug),
      queryFn: () => getPublicCheckout(publicSlug),
    }),

  order: (orderId: string) =>
    queryOptions({
      queryKey: publicCheckoutKeys.order(orderId),
      queryFn: () => getPixOrder(orderId),
      // O PIX confirma de forma assíncrona: a tela de obrigado depende disto.
      refetchInterval: 5000,
      staleTime: 0,
    }),
};
