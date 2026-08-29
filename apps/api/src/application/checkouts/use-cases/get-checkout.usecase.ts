import type { CheckoutDto } from "@/application/checkouts/dtos/checkout.dto";
import { toCheckoutDto } from "@/application/checkouts/mappers/checkout.mapper";
import type { UseCase } from "@/application/shared/use-case";
import { CheckoutNotFoundError } from "@/domain/checkouts/errors/checkout-not-found.error";
import type { CheckoutsRepository } from "@/domain/checkouts/repositories/checkouts.repository";

export interface GetCheckoutInput {
  accountId: string;
  checkoutId: string;
}

export type GetCheckoutUseCase = UseCase<GetCheckoutInput, CheckoutDto>;

export class DefaultGetCheckoutUseCase implements GetCheckoutUseCase {
  private readonly checkoutsRepository: CheckoutsRepository;

  constructor(checkoutsRepository: CheckoutsRepository) {
    this.checkoutsRepository = checkoutsRepository;
  }

  async execute({ accountId, checkoutId }: GetCheckoutInput): Promise<CheckoutDto> {
    const checkout = await this.checkoutsRepository.findById(accountId, checkoutId);

    if (!checkout) {
      throw new CheckoutNotFoundError(checkoutId);
    }

    return toCheckoutDto(checkout);
  }
}
