import type { CheckoutPixelDto } from "@/application/checkouts/dtos/checkout-pixel.dto";
import { toCheckoutPixelDto } from "@/application/checkouts/mappers/checkout-pixel.mapper";
import type { UseCase } from "@/application/shared/use-case";
import { CheckoutNotFoundError } from "@/domain/checkouts/errors/checkout-not-found.error";
import type { CheckoutPixelsRepository } from "@/domain/checkouts/repositories/checkout-pixels.repository";
import type { CheckoutsRepository } from "@/domain/checkouts/repositories/checkouts.repository";

export interface ListCheckoutPixelsInput {
  accountId: string;
  checkoutId: string;
}

export type ListCheckoutPixelsUseCase = UseCase<ListCheckoutPixelsInput, CheckoutPixelDto[]>;

export class DefaultListCheckoutPixelsUseCase implements ListCheckoutPixelsUseCase {
  private readonly checkoutPixelsRepository: CheckoutPixelsRepository;
  private readonly checkoutsRepository: CheckoutsRepository;

  constructor(
    checkoutPixelsRepository: CheckoutPixelsRepository,
    checkoutsRepository: CheckoutsRepository,
  ) {
    this.checkoutPixelsRepository = checkoutPixelsRepository;
    this.checkoutsRepository = checkoutsRepository;
  }

  async execute({ accountId, checkoutId }: ListCheckoutPixelsInput): Promise<CheckoutPixelDto[]> {
    const checkout = await this.checkoutsRepository.findById(accountId, checkoutId);

    if (!checkout) {
      throw new CheckoutNotFoundError(checkoutId);
    }

    const pixels = await this.checkoutPixelsRepository.findByCheckout(accountId, checkoutId);

    return pixels.map(toCheckoutPixelDto);
  }
}
