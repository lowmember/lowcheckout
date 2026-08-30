import type { OfferDto } from "@/application/offers/dtos/offer.dto";
import { toOfferDto } from "@/application/offers/mappers/offer.mapper";
import type { Clock } from "@/application/shared/ports/clock";
import type { UseCase } from "@/application/shared/use-case";
import { OfferNotFoundError } from "@/domain/offers/errors/offer-not-found.error";
import { assertDeliverableIsResolvable } from "@/domain/offers/policies/deliverable.policy";
import type { OffersRepository } from "@/domain/offers/repositories/offers.repository";
import type { OfferStatus } from "@/domain/offers/value-objects/offer-status";
import { ProductNotFoundError } from "@/domain/products/errors/product-not-found.error";
import type { ProductsRepository } from "@/domain/products/repositories/products.repository";

export interface UpdateOfferInput {
  accountId: string;
  offerId: string;
  name?: string;
  priceInCents?: number;
  currency?: string;
  imageUrl?: string | null;
  deliveryUrl?: string | null;
  status?: OfferStatus;
}

export type UpdateOfferUseCase = UseCase<UpdateOfferInput, OfferDto>;

export class DefaultUpdateOfferUseCase implements UpdateOfferUseCase {
  private readonly offersRepository: OffersRepository;
  private readonly productsRepository: ProductsRepository;
  private readonly clock: Clock;

  constructor(
    offersRepository: OffersRepository,
    productsRepository: ProductsRepository,
    clock: Clock,
  ) {
    this.offersRepository = offersRepository;
    this.productsRepository = productsRepository;
    this.clock = clock;
  }

  async execute(input: UpdateOfferInput): Promise<OfferDto> {
    const offer = await this.offersRepository.findById(input.accountId, input.offerId);

    if (!offer) {
      throw new OfferNotFoundError(input.offerId);
    }

    // A oferta não muda de produto (RF-OFER-03): o produto vem sempre da própria oferta.
    const product = await this.productsRepository.findById(input.accountId, offer.parentProductId);

    if (!product) {
      throw new ProductNotFoundError(offer.parentProductId);
    }

    const now = this.clock.now();
    const snapshot = offer.toSnapshot();

    if (input.name !== undefined) {
      offer.rename(input.name, now);
    }

    if (input.priceInCents !== undefined || input.currency !== undefined) {
      offer.changePrice(
        input.priceInCents ?? snapshot.priceInCents,
        input.currency ?? snapshot.currency,
        now,
      );
    }

    if (input.imageUrl !== undefined) {
      offer.changeImageUrl(input.imageUrl, now);
    }

    if (input.deliveryUrl !== undefined) {
      offer.changeDeliveryUrl(input.deliveryUrl, now);
    }

    if (input.status !== undefined) {
      offer.changeStatus(input.status, now);
    }

    // Invariante (c), no salvamento da oferta.
    assertDeliverableIsResolvable(offer.currentDeliveryUrl, product.currentDefaultDeliveryUrl);

    await this.offersRepository.update(offer);

    return toOfferDto(offer, product.currentDefaultDeliveryUrl);
  }
}
