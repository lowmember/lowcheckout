import type { CheckoutContent } from "@lowcheckout/checkout-renderer";

import { useCheckoutOffers } from "@/features/checkouts/hooks/use-checkout-offers";
import type { Checkout } from "@/features/checkouts/types/checkout";
import { useProduct } from "@/features/products";

/**
 * Monta o conteúdo de domínio do renderer a partir de Checkout + Product +
 * primeira oferta vinculada. Nada disso é copiado para o schema visual: trocar
 * o preço em Ofertas reflete no editor sem republicar.
 */
export function useCheckoutContent(checkout: Checkout) {
  const { product, isLoadingProduct } = useProduct(checkout.productId);
  const { checkoutOffers, isLoadingCheckoutOffers } = useCheckoutOffers(checkout.id);

  const firstOffer = checkoutOffers[0]?.offer;

  const content: CheckoutContent = {
    displayName: checkout.displayName,
    productName: product?.name ?? checkout.displayName,
    productDescription: product?.description ?? null,
    // Mesma precedência da página pública: a imagem da oferta ganha da do produto.
    productImageUrl: firstOffer?.imageUrl ?? product?.imageUrl ?? null,
    offerName: firstOffer?.name ?? null,
    priceInCents: firstOffer?.priceInCents ?? null,
    currency: firstOffer?.currency ?? "BRL",
    bannerDesktopUrl: checkout.bannerDesktopUrl,
    bannerMobileUrl: checkout.bannerMobileUrl,
  };

  return {
    content,
    hasLinkedOffer: checkoutOffers.length > 0,
    isLoadingContent: isLoadingProduct || isLoadingCheckoutOffers,
  };
}
