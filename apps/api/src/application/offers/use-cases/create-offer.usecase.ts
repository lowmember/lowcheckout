import type { OfferDto } from "@/application/offers/dtos/offer.dto";
import { toOfferDto } from "@/application/offers/mappers/offer.mapper";
import type { Clock } from "@/application/shared/ports/clock";
import type { IdGenerator } from "@/application/shared/ports/id-generator";
import type { UseCase } from "@/application/shared/use-case";
import { Offer } from "@/domain/offers/entities/offer.entity";
import { assertDeliverableIsResolvable } from "@/domain/offers/policies/deliverable.policy";
import type { OffersRepository } from "@/domain/offers/repositories/offers.repository";
import { ProductNotFoundError } from "@/domain/products/errors/product-not-found.error";
import type { ProductsRepository } from "@/domain/products/repositories/products.repository";

export interface CreateOfferInput {
  accountId: string;
  productId: string;
  name: string;
  priceInCents: number;
  currency: string;
  deliveryUrl?: string | null;
}

export type CreateOfferUseCase = UseCase<CreateOfferInput, OfferDto>;

export class DefaultCreateOfferUseCase implements CreateOfferUseCase {
  private readonly offersRepository: OffersRepository;
  private readonly productsRepository: ProductsRepository;
  private readonly idGenerator: IdGenerator;
  private readonly clock: Clock;

  constructor(
    offersRepository: OffersRepository,
    productsRepository: ProductsRepository,
    idGenerator: IdGenerator,
    clock: Clock,
  ) {
    this.offersRepository = offersRepository;
    this.productsRepository = productsRepository;
    this.idGenerator = idGenerator;
    this.clock = clock;
  }

  async execute(input: CreateOfferInput): Promise<OfferDto> {
    const product = await this.productsRepository.findById(input.accountId, input.productId);

    if (!product) {
      throw new ProductNotFoundError(input.productId);
    }

    const offer = Offer.create({
      id: this.idGenerator.generate(),
      accountId: input.accountId,
      productId: input.productId,
      name: input.name,
      priceInCents: input.priceInCents,
      currency: input.currency,
      deliveryUrl: input.deliveryUrl,
      now: this.clock.now(),
    });

    // Invariante (c), no salvamento da oferta.
    assertDeliverableIsResolvable(offer.currentDeliveryUrl, product.currentDefaultDeliveryUrl);

    await this.offersRepository.create(offer);

    return toOfferDto(offer, product.currentDefaultDeliveryUrl);
  }
}
