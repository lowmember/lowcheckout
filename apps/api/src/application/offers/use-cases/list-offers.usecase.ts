import type { OfferDto } from "@/application/offers/dtos/offer.dto";
import { toOfferDto } from "@/application/offers/mappers/offer.mapper";
import type { PageDto } from "@/application/shared/dtos/page.dto";
import type { UseCase } from "@/application/shared/use-case";
import type { OffersRepository } from "@/domain/offers/repositories/offers.repository";
import type { OfferStatus } from "@/domain/offers/value-objects/offer-status";
import { ProductNotFoundError } from "@/domain/products/errors/product-not-found.error";
import type { ProductsRepository } from "@/domain/products/repositories/products.repository";

export interface ListOffersInput {
  accountId: string;
  productId: string;
  page: number;
  perPage: number;
  status?: OfferStatus;
}

export type ListOffersUseCase = UseCase<ListOffersInput, PageDto<OfferDto>>;

export class DefaultListOffersUseCase implements ListOffersUseCase {
  private readonly offersRepository: OffersRepository;
  private readonly productsRepository: ProductsRepository;

  constructor(offersRepository: OffersRepository, productsRepository: ProductsRepository) {
    this.offersRepository = offersRepository;
    this.productsRepository = productsRepository;
  }

  async execute(input: ListOffersInput): Promise<PageDto<OfferDto>> {
    const product = await this.productsRepository.findById(input.accountId, input.productId);

    if (!product) {
      throw new ProductNotFoundError(input.productId);
    }

    const { items, total } = await this.offersRepository.findMany(input);

    return {
      data: items.map((offer) => toOfferDto(offer, product.currentDefaultDeliveryUrl)),
      meta: { page: input.page, perPage: input.perPage, total },
    };
  }
}
