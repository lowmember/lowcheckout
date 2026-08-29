/** O vínculo checkout↔oferta e a URL pública que ele gerou (RF-CHK-05). */
export interface CheckoutOfferDto {
  id: string;
  checkoutId: string;
  offerId: string;
  productId: string;
  publicSlug: string;
  position: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
