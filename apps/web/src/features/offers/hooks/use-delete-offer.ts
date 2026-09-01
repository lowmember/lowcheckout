import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteOffer } from "@/features/offers/api/offers.api";
import { offerKeys } from "@/features/offers/api/offers.queries";
import { getApiErrorMessage } from "@/shared/api/get-error-message";

interface UseDeleteOfferOptions {
  productId: string;
  offerId: string;
  onSuccess?: () => void;
}

/** Deleção definitiva da oferta — a API recusa se houver checkout ou pedido ligado. */
export function useDeleteOffer({ productId, offerId, onSuccess }: UseDeleteOfferOptions) {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, isError, error } = useMutation({
    mutationFn: () => deleteOffer(offerId),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: offerKeys.detail(offerId) });
      queryClient.invalidateQueries({ queryKey: offerKeys.listByProduct(productId) });
      onSuccess?.();
    },
  });

  return {
    removeOffer: mutateAsync,
    isRemovingOffer: isPending,
    hasRemoveOfferError: isError,
    removeOfferErrorMessage: getApiErrorMessage(error, "Não foi possível deletar a oferta."),
  };
}
