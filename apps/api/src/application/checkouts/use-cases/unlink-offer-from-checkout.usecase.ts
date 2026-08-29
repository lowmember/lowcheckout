import type { UseCase } from "@/application/shared/use-case";
import { CheckoutNotFoundError } from "@/domain/checkouts/errors/checkout-not-found.error";
import { CheckoutOfferNotFoundError } from "@/domain/checkouts/errors/checkout-offer-not-found.error";
import type { CheckoutOffersRepository } from "@/domain/checkouts/repositories/checkout-offers.repository";
import type { CheckoutsRepository } from "@/domain/checkouts/repositories/checkouts.repository";

export interface UnlinkOfferFromCheckoutInput {
  accountId: string;
  checkoutId: string;
  offerId: string;
}

export type UnlinkOfferFromCheckoutUseCase = UseCase<UnlinkOfferFromCheckoutInput, void>;

/**
 * Desfaz o vínculo e, com ele, a URL pública daquele par (RF-CHK-05).
 * Nenhuma outra URL do checkout é afetada.
 */
export class DefaultUnlinkOfferFromCheckoutUseCase implements UnlinkOfferFromCheckoutUseCase {
  private readonly checkoutOffersRepository: CheckoutOffersRepository;
  private readonly checkoutsRepository: CheckoutsRepository;

  constructor(
    checkoutOffersRepository: CheckoutOffersRepository,
    checkoutsRepository: CheckoutsRepository,
  ) {
    this.checkoutOffersRepository = checkoutOffersRepository;
    this.checkoutsRepository = checkoutsRepository;
  }

  async execute({ accountId, checkoutId, offerId }: UnlinkOfferFromCheckoutInput): Promise<void> {
    const checkout = await this.checkoutsRepository.findById(accountId, checkoutId);

    if (!checkout) {
      throw new CheckoutNotFoundError(checkoutId);
    }

    const unlinked = await this.checkoutOffersRepository.delete(accountId, checkoutId, offerId);

    if (!unlinked) {
      throw new CheckoutOfferNotFoundError(checkoutId, offerId);
    }
  }
}
