import type { ProductDto } from "@/application/products/dtos/product.dto";
import { toProductDto } from "@/application/products/mappers/product.mapper";
import type { UseCase } from "@/application/shared/use-case";
import { ProductNotFoundError } from "@/domain/products/errors/product-not-found.error";
import type { ProductsRepository } from "@/domain/products/repositories/products.repository";

export interface GetProductInput {
  accountId: string;
  productId: string;
}

export type GetProductUseCase = UseCase<GetProductInput, ProductDto>;

export class DefaultGetProductUseCase implements GetProductUseCase {
  private readonly productsRepository: ProductsRepository;

  constructor(productsRepository: ProductsRepository) {
    this.productsRepository = productsRepository;
  }

  async execute({ accountId, productId }: GetProductInput): Promise<ProductDto> {
    const product = await this.productsRepository.findById(accountId, productId);

    if (!product) {
      throw new ProductNotFoundError(productId);
    }

    return toProductDto(product);
  }
}
