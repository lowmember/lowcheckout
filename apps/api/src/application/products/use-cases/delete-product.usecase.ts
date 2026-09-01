import type { UseCase } from "@/application/shared/use-case";
import type { CheckoutsRepository } from "@/domain/checkouts/repositories/checkouts.repository";
import type { OffersRepository } from "@/domain/offers/repositories/offers.repository";
import { ProductInUseError } from "@/domain/products/errors/product-in-use.error";
import { ProductNotFoundError } from "@/domain/products/errors/product-not-found.error";
import type { ProductsRepository } from "@/domain/products/repositories/products.repository";

export interface DeleteProductInput {
  accountId: string;
  productId: string;
}

export type DeleteProductUseCase = UseCase<DeleteProductInput, void>;

export class DefaultDeleteProductUseCase implements DeleteProductUseCase {
  private readonly productsRepository: ProductsRepository;
  private readonly offersRepository: OffersRepository;
  private readonly checkoutsRepository: CheckoutsRepository;

  constructor(
    productsRepository: ProductsRepository,
    offersRepository: OffersRepository,
    checkoutsRepository: CheckoutsRepository,
  ) {
    this.productsRepository = productsRepository;
    this.offersRepository = offersRepository;
    this.checkoutsRepository = checkoutsRepository;
  }

  async execute({ accountId, productId }: DeleteProductInput): Promise<void> {
    const product = await this.productsRepository.findById(accountId, productId);

    if (!product) {
      throw new ProductNotFoundError(productId);
    }

    await this.assertNothingDependsOnIt(accountId, productId);

    const deleted = await this.productsRepository.delete(accountId, productId);

    if (!deleted) {
      throw new ProductNotFoundError(productId);
    }
  }

  /**
   * Regra entre agregados: oferta e checkout referenciam o produto, então a
   * deleção só passa com o produto já sem vínculo nenhum.
   */
  private async assertNothingDependsOnIt(accountId: string, productId: string): Promise<void> {
    const [offersByProduct, checkoutsByProduct] = await Promise.all([
      this.offersRepository.countByProductIds(accountId, [productId]),
      this.checkoutsRepository.countByProductIds(accountId, [productId]),
    ]);

    const dependentOffers = offersByProduct.get(productId) ?? 0;
    const dependentCheckouts = checkoutsByProduct.get(productId) ?? 0;

    if (dependentOffers > 0 || dependentCheckouts > 0) {
      throw new ProductInUseError(dependentOffers, dependentCheckouts);
    }
  }
}
