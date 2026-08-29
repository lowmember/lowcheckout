import type { ProductDto } from "@/application/products/dtos/product.dto";
import { toProductDto } from "@/application/products/mappers/product.mapper";
import type { Clock } from "@/application/shared/ports/clock";
import type { UseCase } from "@/application/shared/use-case";
import type { OffersRepository } from "@/domain/offers/repositories/offers.repository";
import { ProductDeliveryUrlInUseError } from "@/domain/products/errors/product-delivery-url-in-use.error";
import { ProductNotFoundError } from "@/domain/products/errors/product-not-found.error";
import type { ProductsRepository } from "@/domain/products/repositories/products.repository";

export interface UpdateProductInput {
  accountId: string;
  productId: string;
  name?: string;
  description?: string | null;
  imageUrl?: string | null;
  defaultDeliveryUrl?: string | null;
}

export type UpdateProductUseCase = UseCase<UpdateProductInput, ProductDto>;

export class DefaultUpdateProductUseCase implements UpdateProductUseCase {
  private readonly productsRepository: ProductsRepository;
  private readonly offersRepository: OffersRepository;
  private readonly clock: Clock;

  constructor(
    productsRepository: ProductsRepository,
    offersRepository: OffersRepository,
    clock: Clock,
  ) {
    this.productsRepository = productsRepository;
    this.offersRepository = offersRepository;
    this.clock = clock;
  }

  async execute(input: UpdateProductInput): Promise<ProductDto> {
    const product = await this.productsRepository.findById(input.accountId, input.productId);

    if (!product) {
      throw new ProductNotFoundError(input.productId);
    }

    if (input.defaultDeliveryUrl !== undefined) {
      await this.assertFallbackStaysResolvable(input, product.currentDefaultDeliveryUrl);
    }

    const now = this.clock.now();

    if (input.name !== undefined) {
      product.rename(input.name, now);
    }

    if (input.description !== undefined) {
      product.changeDescription(input.description, now);
    }

    if (input.imageUrl !== undefined) {
      product.changeImageUrl(input.imageUrl, now);
    }

    if (input.defaultDeliveryUrl !== undefined) {
      product.changeDefaultDeliveryUrl(input.defaultDeliveryUrl, now);
    }

    await this.productsRepository.update(product);

    return toProductDto(product);
  }

  /**
   * Segunda metade da invariante (c): limpar o entregável padrão invalidaria à
   * distância toda oferta ativa que hoje depende do fallback (RF-OFER-02). É uma
   * regra entre agregados, por isso mora aqui e não na entidade `Offer`.
   */
  private async assertFallbackStaysResolvable(
    input: UpdateProductInput,
    currentDefaultDeliveryUrl: string | null,
  ): Promise<void> {
    const isClearing = input.defaultDeliveryUrl === null || input.defaultDeliveryUrl?.trim() === "";

    if (!isClearing || currentDefaultDeliveryUrl === null) {
      return;
    }

    const dependentOffers = await this.offersRepository.countActiveRelyingOnProductFallback(
      input.accountId,
      input.productId,
    );

    if (dependentOffers > 0) {
      throw new ProductDeliveryUrlInUseError(dependentOffers);
    }
  }
}
