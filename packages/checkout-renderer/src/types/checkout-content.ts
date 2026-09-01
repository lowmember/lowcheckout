/**
 * Dados de domínio que o renderer consome.
 *
 * Vêm de Checkout / Product / Offer — nunca do schema visual. É essa separação
 * que impede o builder de duplicar nome e preço da oferta: o preço continua
 * sendo editado em Ofertas, não dentro do editor.
 */
export interface CheckoutContent {
  displayName: string;
  productName: string;
  productDescription: string | null;
  productImageUrl: string | null;
  offerName: string | null;
  priceInCents: number | null;
  currency: string;
  bannerDesktopUrl: string | null;
  bannerMobileUrl: string | null;
  /** Suporte ao comprador, definido e confirmado no checkout. */
  contactEmail: string | null;
}

/** Conteúdo de exemplo para as miniaturas de template, onde não há oferta ainda. */
export const SAMPLE_CONTENT: CheckoutContent = {
  displayName: "Sua marca",
  productName: "Seu produto",
  productDescription: "Uma descrição curta do que o comprador leva.",
  productImageUrl: null,
  offerName: "Oferta principal",
  priceInCents: 9700,
  currency: "BRL",
  bannerDesktopUrl: null,
  bannerMobileUrl: null,
  contactEmail: "contato@suamarca.com",
};
