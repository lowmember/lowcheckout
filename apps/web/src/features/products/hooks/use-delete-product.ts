import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteProduct } from "@/features/products/api/products.api";
import { productKeys } from "@/features/products/api/products.queries";
import { getApiErrorMessage } from "@/shared/api/get-error-message";

interface UseDeleteProductOptions {
  productId: string;
  onSuccess?: () => void;
}

/** Deleção definitiva do produto — a API recusa se houver oferta ou checkout ligado. */
export function useDeleteProduct({ productId, onSuccess }: UseDeleteProductOptions) {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, isError, error } = useMutation({
    mutationFn: () => deleteProduct(productId),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: productKeys.detail(productId) });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      onSuccess?.();
    },
  });

  return {
    removeProduct: mutateAsync,
    isRemovingProduct: isPending,
    hasRemoveProductError: isError,
    removeProductErrorMessage: getApiErrorMessage(error, "Não foi possível deletar o produto."),
  };
}
