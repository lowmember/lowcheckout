import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  linkOfferToCheckout,
  unlinkOfferFromCheckout,
} from "@/features/checkouts/api/checkouts.api";
import { checkoutKeys, checkoutQueries } from "@/features/checkouts/api/checkouts.queries";
import { getApiErrorMessage } from "@/shared/api/get-error-message";

/** Vincular e desvincular ofertas, cada vínculo com sua URL pública (RF-CHK-05). */
export function useCheckoutOffers(checkoutId: string) {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery(checkoutQueries.offers(checkoutId));

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: checkoutKeys.offers(checkoutId) });
    queryClient.invalidateQueries({ queryKey: checkoutKeys.lists() });
  }

  const link = useMutation({
    mutationFn: (offerId: string) => linkOfferToCheckout(checkoutId, offerId),
    onSuccess: invalidate,
  });

  const unlink = useMutation({
    mutationFn: (offerId: string) => unlinkOfferFromCheckout(checkoutId, offerId),
    onSuccess: invalidate,
  });

  return {
    checkoutOffers: data?.data ?? [],
    isLoadingCheckoutOffers: isLoading,
    hasCheckoutOffersError: isError,
    linkOffer: link.mutateAsync,
    isLinkingOffer: link.isPending,
    unlinkOffer: unlink.mutateAsync,
    isUnlinkingOffer: unlink.isPending,
    checkoutOffersErrorMessage:
      link.isError || unlink.isError
        ? getApiErrorMessage(
            link.error ?? unlink.error,
            "Não foi possível atualizar as ofertas deste checkout.",
          )
        : null,
  };
}
