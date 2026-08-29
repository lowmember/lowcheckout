import type { ProductDto } from "@/application/products/dtos/product.dto";
import { toProductDto } from "@/application/products/mappers/product.mapper";
import type { Clock } from "@/application/shared/ports/clock";
import type { IdGenerator } from "@/application/shared/ports/id-generator";
import type { UseCase } from "@/application/shared/use-case";
import { Product } from "@/domain/products/entities/product.entity";
import type { ProductsRepository } from "@/domain/products/repositories/products.repository";

export interface CreateProductInput {
  accountId: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  defaultDeliveryUrl?: string | null;
}

export type CreateProductUseCase = UseCase<CreateProductInput, ProductDto>;

export class DefaultCreateProductUseCase implements CreateProductUseCase {
  private readonly productsRepository: ProductsRepository;
  private readonly idGenerator: IdGenerator;
  private readonly clock: Clock;

  constructor(productsRepository: ProductsRepository, idGenerator: IdGenerator, clock: Clock) {
    this.productsRepository = productsRepository;
    this.idGenerator = idGenerator;
    this.clock = clock;
  }

  async execute(input: CreateProductInput): Promise<ProductDto> {
    const product = Product.create({
      id: this.idGenerator.generate(),
      accountId: input.accountId,
      name: input.name,
      description: input.description,
      imageUrl: input.imageUrl,
      defaultDeliveryUrl: input.defaultDeliveryUrl,
      now: this.clock.now(),
    });

    await this.productsRepository.create(product);

    return toProductDto(product);
  }
}
