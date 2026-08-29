import type { OfferDto } from "@/application/offers/dtos/offer.dto";
import { toOfferDto } from "@/application/offers/mappers/offer.mapper";
import type { UseCase } from "@/application/shared/use-case";
import { OfferNotFoundError } from "@/domain/offers/errors/offer-not-found.error";
import type { OffersRepository } from "@/domain/offers/repositories/offers.repository";
import { ProductNotFoundError } from "@/domain/products/errors/product-not-found.error";
import type { ProductsRepository } from "@/domain/products/repositories/products.repository";

export interface GetOfferInput {
  accountId: string;
  offerId: string;
}

export type GetOfferUseCase = UseCase<GetOfferInput, OfferDto>;

export class DefaultGetOfferUseCase implements GetOfferUseCase {
  private readonly offersRepository: OffersRepository;
  private readonly productsRepository: ProductsRepository;

  constructor(offersRepository: OffersRepository, productsRepository: ProductsRepository) {
    this.offersRepository = offersRepository;
    this.productsRepository = productsRepository;
  }

  async execute({ accountId, offerId }: GetOfferInput): Promise<OfferDto> {
    const offer = await this.offersRepository.findById(accountId, offerId);

    if (!offer) {
      throw new OfferNotFoundError(offerId);
    }

    const product = await this.productsRepository.findById(accountId, offer.parentProductId);

    if (!product) {
      throw new ProductNotFoundError(offer.parentProductId);
    }

    return toOfferDto(offer, product.currentDefaultDeliveryUrl);
  }
}
