import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createProduct, updateProduct } from "@/features/products/api/products.api";
import { productKeys } from "@/features/products/api/products.queries";
import type { CreateProductInput, Product } from "@/features/products/types/product";
import { getApiErrorMessage } from "@/shared/api/get-error-message";

interface UseSaveProductOptions {
  productId?: string;
  onSuccess?: (product: Product) => void;
}

/** Criação (RF-PROD-01) e edição (RF-PROD-03) compartilham o mesmo formulário. */
export function useSaveProduct({ productId, onSuccess }: UseSaveProductOptions = {}) {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, isError, error } = useMutation({
    mutationFn: (input: CreateProductInput) =>
      productId ? updateProduct(productId, input) : createProduct(input),
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      if (productId) {
        queryClient.invalidateQueries({ queryKey: productKeys.detail(productId) });
      }
      onSuccess?.(product);
    },
  });

  return {
    saveProduct: mutateAsync,
    isSavingProduct: isPending,
    hasSaveProductError: isError,
    saveProductErrorMessage: getApiErrorMessage(error, "Não foi possível salvar o produto."),
  };
}
