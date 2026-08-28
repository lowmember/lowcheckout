import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createOffer, updateOffer } from "@/features/offers/api/offers.api";
import { offerKeys } from "@/features/offers/api/offers.queries";
import type { CreateOfferInput, Offer } from "@/features/offers/types/offer";
import { getApiErrorMessage } from "@/shared/api/get-error-message";

interface UseSaveOfferOptions {
  productId: string;
  offerId?: string;
  onSuccess?: (offer: Offer) => void;
}

/** Criação (RF-OFER-01) e edição (RF-OFER-03) pelo mesmo formulário. */
export function useSaveOffer({ productId, offerId, onSuccess }: UseSaveOfferOptions) {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, isError, error } = useMutation({
    mutationFn: (input: CreateOfferInput) =>
      offerId ? updateOffer(offerId, input) : createOffer(productId, input),
    onSuccess: (offer) => {
      queryClient.invalidateQueries({ queryKey: offerKeys.listByProduct(productId) });
      if (offerId) queryClient.invalidateQueries({ queryKey: offerKeys.detail(offerId) });
      onSuccess?.(offer);
    },
  });

  return {
    saveOffer: mutateAsync,
    isSavingOffer: isPending,
    hasSaveOfferError: isError,
    saveOfferErrorMessage: getApiErrorMessage(error, "Não foi possível salvar a oferta."),
  };
}
