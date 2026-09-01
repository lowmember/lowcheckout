import type { CheckoutDto } from "@/application/checkouts/dtos/checkout.dto";
import { toCheckoutDto } from "@/application/checkouts/mappers/checkout.mapper";
import type { Clock } from "@/application/shared/ports/clock";
import type { Hasher } from "@/application/shared/ports/hasher";
import type { UseCase } from "@/application/shared/use-case";
import { CheckoutNotFoundError } from "@/domain/checkouts/errors/checkout-not-found.error";
import type { CheckoutsRepository } from "@/domain/checkouts/repositories/checkouts.repository";

export interface ConfirmCheckoutContactEmailInput {
  accountId: string;
  checkoutId: string;
  code: string;
}

export type ConfirmCheckoutContactEmailUseCase = UseCase<
  ConfirmCheckoutContactEmailInput,
  CheckoutDto
>;

/** RF-CHK-11. O código confere contra o hash guardado; a entidade decide o resto. */
export class DefaultConfirmCheckoutContactEmailUseCase
  implements ConfirmCheckoutContactEmailUseCase
{
  private readonly checkoutsRepository: CheckoutsRepository;
  private readonly hasher: Hasher;
  private readonly clock: Clock;

  constructor(checkoutsRepository: CheckoutsRepository, hasher: Hasher, clock: Clock) {
    this.checkoutsRepository = checkoutsRepository;
    this.hasher = hasher;
    this.clock = clock;
  }

  async execute(input: ConfirmCheckoutContactEmailInput): Promise<CheckoutDto> {
    const checkout = await this.checkoutsRepository.findById(input.accountId, input.checkoutId);

    if (!checkout) {
      throw new CheckoutNotFoundError(input.checkoutId);
    }

    checkout.confirmContactEmail(this.hasher.hash(input.code.trim()), this.clock.now());

    await this.checkoutsRepository.update(checkout);

    return toCheckoutDto(checkout);
  }
}
