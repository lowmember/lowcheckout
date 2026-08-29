import { queryOptions } from "@tanstack/react-query";

import { getOffer, listProductOffers } from "@/features/offers/api/offers.api";

export const offerKeys = {
  all: ["offers"] as const,
  lists: () => [...offerKeys.all, "list"] as const,
  listByProduct: (productId: string) => [...offerKeys.lists(), { productId }] as const,
  details: () => [...offerKeys.all, "detail"] as const,
  detail: (offerId: string) => [...offerKeys.details(), offerId] as const,
};

export const offerQueries = {
  listByProduct: (productId: string) =>
    queryOptions({
      queryKey: offerKeys.listByProduct(productId),
      queryFn: () => listProductOffers(productId),
    }),

  detail: (offerId: string) =>
    queryOptions({
      queryKey: offerKeys.detail(offerId),
      queryFn: () => getOffer(offerId),
    }),
};
