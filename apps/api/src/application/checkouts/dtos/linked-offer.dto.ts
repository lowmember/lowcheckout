import type { CheckoutOfferDto } from "@/application/checkouts/dtos/checkout-offer.dto";
import type { OfferDto } from "@/application/offers/dtos/offer.dto";

/** O vínculo somado à oferta que ele expõe — o que a área de ofertas mostra (RF-CHK-06). */
export interface LinkedOfferDto extends CheckoutOfferDto {
  offer: OfferDto;
}
