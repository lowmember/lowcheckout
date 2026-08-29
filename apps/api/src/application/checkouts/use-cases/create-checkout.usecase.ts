import type { CheckoutDto } from "@/application/checkouts/dtos/checkout.dto";
import { toCheckoutDto } from "@/application/checkouts/mappers/checkout.mapper";
import type { Clock } from "@/application/shared/ports/clock";
import type { IdGenerator } from "@/application/shared/ports/id-generator";
import type { UseCase } from "@/application/shared/use-case";
import { Checkout } from "@/domain/checkouts/entities/checkout.entity";
import type { CheckoutsRepository } from "@/domain/checkouts/repositories/checkouts.repository";
import { ProductNotFoundError } from "@/domain/products/errors/product-not-found.error";
import type { ProductsRepository } from "@/domain/products/repositories/products.repository";

export interface CreateCheckoutInput {
  accountId: string;
  productId: string;
  internalTitle: string;
  displayName: string;
  bannerDesktopUrl?: string | null;
  bannerMobileUrl?: string | null;
}

export type CreateCheckoutUseCase = UseCase<CreateCheckoutInput, CheckoutDto>;

export class DefaultCreateCheckoutUseCase implements CreateCheckoutUseCase {
  private readonly checkoutsRepository: CheckoutsRepository;
  private readonly productsRepository: ProductsRepository;
  private readonly idGenerator: IdGenerator;
  private readonly clock: Clock;

  constructor(
    checkoutsRepository: CheckoutsRepository,
    productsRepository: ProductsRepository,
    idGenerator: IdGenerator,
    clock: Clock,
  ) {
    this.checkoutsRepository = checkoutsRepository;
    this.productsRepository = productsRepository;
    this.idGenerator = idGenerator;
    this.clock = clock;
  }

  async execute(input: CreateCheckoutInput): Promise<CheckoutDto> {
    const product = await this.productsRepository.findById(input.accountId, input.productId);

    if (!product) {
      throw new ProductNotFoundError(input.productId);
    }

    const checkout = Checkout.create({
      id: this.idGenerator.generate(),
      accountId: input.accountId,
      productId: input.productId,
      internalTitle: input.internalTitle,
      displayName: input.displayName,
      bannerDesktopUrl: input.bannerDesktopUrl,
      bannerMobileUrl: input.bannerMobileUrl,
      now: this.clock.now(),
    });

    await this.checkoutsRepository.create(checkout);

    return toCheckoutDto(checkout);
  }
}
