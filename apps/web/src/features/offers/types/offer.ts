export type OfferStatus = "active" | "archived";

export interface Offer {
  id: string;
  productId: string;
  name: string;
  priceInCents: number;
  currency: string;
  /** Imagem própria da oferta. `null` = o checkout usa a imagem do produto. */
  imageUrl: string | null;
  /** URL própria da oferta. `null` significa herdar a do produto (RF-OFER-02). */
  deliveryUrl: string | null;
  /** Já resolvida pela API: oferta → produto. */
  resolvedDeliveryUrl: string | null;
  status: OfferStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOfferInput {
  name: string;
  priceInCents: number;
  currency: string;
  imageUrl?: string | null;
  deliveryUrl?: string | null;
}

export interface UpdateOfferInput extends Partial<Omit<CreateOfferInput, "currency">> {
  status?: OfferStatus;
}

export type OfferFieldErrors = Partial<
  Record<"name" | "price" | "imageUrl" | "deliveryUrl", string>
>;
