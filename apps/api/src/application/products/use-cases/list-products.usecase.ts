import type { ProductListItemDto } from "@/application/products/dtos/product.dto";
import { toProductListItemDto } from "@/application/products/mappers/product.mapper";
import type { PageDto } from "@/application/shared/dtos/page.dto";
import type { UseCase } from "@/application/shared/use-case";
import type { OffersRepository } from "@/domain/offers/repositories/offers.repository";
import type { ProductsRepository } from "@/domain/products/repositories/products.repository";
import type { ProductStatus } from "@/domain/products/value-objects/product-status";

export interface ListProductsInput {
  accountId: string;
  page: number;
  perPage: number;
  status?: ProductStatus;
  search?: string;
}

export type ListProductsUseCase = UseCase<ListProductsInput, PageDto<ProductListItemDto>>;

export class DefaultListProductsUseCase implements ListProductsUseCase {
  private readonly productsRepository: ProductsRepository;
  private readonly offersRepository: OffersRepository;

  constructor(productsRepository: ProductsRepository, offersRepository: OffersRepository) {
    this.productsRepository = productsRepository;
    this.offersRepository = offersRepository;
  }

  async execute(input: ListProductsInput): Promise<PageDto<ProductListItemDto>> {
    const { items, total } = await this.productsRepository.findMany(input);

    // RF-PROD-02: a lista mostra a quantidade de ofertas de cada produto.
    const offersCountByProduct = await this.offersRepository.countByProductIds(
      input.accountId,
      items.map((product) => product.productId),
    );

    return {
      data: items.map((product) =>
        toProductListItemDto(product, offersCountByProduct.get(product.productId) ?? 0),
      ),
      meta: { page: input.page, perPage: input.perPage, total },
    };
  }
}
