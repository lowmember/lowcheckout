import type { LinkedOfferDto } from "@/application/checkouts/dtos/linked-offer.dto";
import { toCheckoutOfferDto } from "@/application/checkouts/mappers/checkout-offer.mapper";
import { toOfferDto } from "@/application/offers/mappers/offer.mapper";
import type { UseCase } from "@/application/shared/use-case";
import { CheckoutNotFoundError } from "@/domain/checkouts/errors/checkout-not-found.error";
import type { CheckoutOffersRepository } from "@/domain/checkouts/repositories/checkout-offers.repository";
import type { CheckoutsRepository } from "@/domain/checkouts/repositories/checkouts.repository";
import type { OffersRepository } from "@/domain/offers/repositories/offers.repository";
import { ProductNotFoundError } from "@/domain/products/errors/product-not-found.error";
import type { ProductsRepository } from "@/domain/products/repositories/products.repository";

export interface ListCheckoutOffersInput {
  accountId: string;
  checkoutId: string;
}

export type ListCheckoutOffersUseCase = UseCase<ListCheckoutOffersInput, LinkedOfferDto[]>;

/**
 * Área de ofertas da página interna (RF-CHK-06): cada vínculo com a sua URL
 * pública e os dados da oferta que ele expõe.
 */
export class DefaultListCheckoutOffersUseCase implements ListCheckoutOffersUseCase {
  private readonly checkoutOffersRepository: CheckoutOffersRepository;
  private readonly checkoutsRepository: CheckoutsRepository;
  private readonly offersRepository: OffersRepository;
  private readonly productsRepository: ProductsRepository;

  constructor(
    checkoutOffersRepository: CheckoutOffersRepository,
    checkoutsRepository: CheckoutsRepository,
    offersRepository: OffersRepository,
    productsRepository: ProductsRepository,
  ) {
    this.checkoutOffersRepository = checkoutOffersRepository;
    this.checkoutsRepository = checkoutsRepository;
    this.offersRepository = offersRepository;
    this.productsRepository = productsRepository;
  }

  async execute({ accountId, checkoutId }: ListCheckoutOffersInput): Promise<LinkedOfferDto[]> {
    const checkout = await this.checkoutsRepository.findById(accountId, checkoutId);

    if (!checkout) {
      throw new CheckoutNotFoundError(checkoutId);
    }

    const links = await this.checkoutOffersRepository.findByCheckout(accountId, checkoutId);

    if (links.length === 0) {
      return [];
    }

    // Todo vínculo é do produto do checkout (invariante (a)): um produto basta.
    const product = await this.productsRepository.findById(accountId, checkout.soldProductId);

    if (!product) {
      throw new ProductNotFoundError(checkout.soldProductId);
    }

    const offers = await this.offersRepository.findByIds(
      accountId,
      links.map((link) => link.toSnapshot().offerId),
    );

    return links.flatMap((link) => {
      const snapshot = link.toSnapshot();
      const offer = offers.get(snapshot.offerId);

      // Vínculo órfão não deveria existir (FK `restrict`), mas não é motivo para
      // derrubar a listagem inteira da página interna.
      return offer
        ? [
            {
              ...toCheckoutOfferDto(link),
              offer: toOfferDto(offer, product.currentDefaultDeliveryUrl),
            },
          ]
        : [];
    });
  }
}
