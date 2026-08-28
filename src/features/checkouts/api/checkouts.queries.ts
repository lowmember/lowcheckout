import { queryOptions } from "@tanstack/react-query";

import {
  getCheckout,
  getCheckoutPixels,
  listCheckoutOffers,
  listCheckouts,
} from "@/features/checkouts/api/checkouts.api";
import type { ListCheckoutsParams } from "@/features/checkouts/types/checkout";

export const checkoutKeys = {
  all: ["checkouts"] as const,
  lists: () => [...checkoutKeys.all, "list"] as const,
  list: (params: ListCheckoutsParams) => [...checkoutKeys.lists(), params] as const,
  details: () => [...checkoutKeys.all, "detail"] as const,
  detail: (checkoutId: string) => [...checkoutKeys.details(), checkoutId] as const,
  offers: (checkoutId: string) => [...checkoutKeys.detail(checkoutId), "offers"] as const,
  pixels: (checkoutId: string) => [...checkoutKeys.detail(checkoutId), "pixels"] as const,
};

export const checkoutQueries = {
  list: (params: ListCheckoutsParams = {}) =>
    queryOptions({
      queryKey: checkoutKeys.list(params),
      queryFn: () => listCheckouts(params),
    }),

  detail: (checkoutId: string) =>
    queryOptions({
      queryKey: checkoutKeys.detail(checkoutId),
      queryFn: () => getCheckout(checkoutId),
    }),

  offers: (checkoutId: string) =>
    queryOptions({
      queryKey: checkoutKeys.offers(checkoutId),
      queryFn: () => listCheckoutOffers(checkoutId),
    }),

  pixels: (checkoutId: string) =>
    queryOptions({
      queryKey: checkoutKeys.pixels(checkoutId),
      queryFn: () => getCheckoutPixels(checkoutId),
    }),
};
