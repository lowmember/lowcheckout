import type { CheckoutDto } from "@/application/checkouts/dtos/checkout.dto";
import { toCheckoutDto } from "@/application/checkouts/mappers/checkout.mapper";
import type { Clock } from "@/application/shared/ports/clock";
import type { UseCase } from "@/application/shared/use-case";
import { CheckoutNotFoundError } from "@/domain/checkouts/errors/checkout-not-found.error";
import type { CheckoutsRepository } from "@/domain/checkouts/repositories/checkouts.repository";
import type { CheckoutStatus } from "@/domain/checkouts/value-objects/checkout-status";

/**
 * Só os dados de identidade do checkout (RF-CHK-03). `productId` não entra:
 * o produto é imutável após a criação — trocar exige criar outro checkout.
 */
export interface UpdateCheckoutInput {
  accountId: string;
  checkoutId: string;
  internalTitle?: string;
  displayName?: string;
  bannerDesktopUrl?: string | null;
  bannerMobileUrl?: string | null;
  status?: CheckoutStatus;
}

export type UpdateCheckoutUseCase = UseCase<UpdateCheckoutInput, CheckoutDto>;

export class DefaultUpdateCheckoutUseCase implements UpdateCheckoutUseCase {
  private readonly checkoutsRepository: CheckoutsRepository;
  private readonly clock: Clock;

  constructor(checkoutsRepository: CheckoutsRepository, clock: Clock) {
    this.checkoutsRepository = checkoutsRepository;
    this.clock = clock;
  }

  async execute(input: UpdateCheckoutInput): Promise<CheckoutDto> {
    const checkout = await this.checkoutsRepository.findById(input.accountId, input.checkoutId);

    if (!checkout) {
      throw new CheckoutNotFoundError(input.checkoutId);
    }

    const now = this.clock.now();

    if (input.internalTitle !== undefined) {
      checkout.changeInternalTitle(input.internalTitle, now);
    }

    if (input.displayName !== undefined) {
      checkout.changeDisplayName(input.displayName, now);
    }

    if (input.bannerDesktopUrl !== undefined) {
      checkout.changeBannerDesktopUrl(input.bannerDesktopUrl, now);
    }

    if (input.bannerMobileUrl !== undefined) {
      checkout.changeBannerMobileUrl(input.bannerMobileUrl, now);
    }

    if (input.status !== undefined) {
      checkout.changeStatus(input.status, now);
    }

    await this.checkoutsRepository.update(checkout);

    return toCheckoutDto(checkout);
  }
}
