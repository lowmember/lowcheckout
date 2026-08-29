import type { CheckoutOfferDto } from "@/application/checkouts/dtos/checkout-offer.dto";
import { toCheckoutOfferDto } from "@/application/checkouts/mappers/checkout-offer.mapper";
import type { Clock } from "@/application/shared/ports/clock";
import type { IdGenerator } from "@/application/shared/ports/id-generator";
import type { UseCase } from "@/application/shared/use-case";
import type { Checkout } from "@/domain/checkouts/entities/checkout.entity";
import { CheckoutOffer } from "@/domain/checkouts/entities/checkout-offer.entity";
import { CheckoutNotFoundError } from "@/domain/checkouts/errors/checkout-not-found.error";
import { OfferAlreadyLinkedError } from "@/domain/checkouts/errors/offer-already-linked.error";
import { OfferProductMismatchError } from "@/domain/checkouts/errors/offer-product-mismatch.error";
import type { CheckoutOffersRepository } from "@/domain/checkouts/repositories/checkout-offers.repository";
import type { CheckoutsRepository } from "@/domain/checkouts/repositories/checkouts.repository";
import { PublicSlug } from "@/domain/checkouts/value-objects/public-slug";
import { OfferNotFoundError } from "@/domain/offers/errors/offer-not-found.error";
import type { OffersRepository } from "@/domain/offers/repositories/offers.repository";
import { InvariantViolationError } from "@/domain/shared/errors/domain.error";

const MAX_SLUG_ATTEMPTS = 5;

export interface LinkOfferToCheckoutInput {
  accountId: string;
  checkoutId: string;
  offerId: string;
}

export type LinkOfferToCheckoutUseCase = UseCase<LinkOfferToCheckoutInput, CheckoutOfferDto>;

/**
 * Vínculo manual entre checkout e oferta (RF-CHK-05). É aqui que a metade de
 * domínio da invariante (a) age: oferta de outro produto é recusada com
 * `OfferProductMismatchError` antes mesmo de o banco ver o insert.
 */
export class DefaultLinkOfferToCheckoutUseCase implements LinkOfferToCheckoutUseCase {
  private readonly checkoutOffersRepository: CheckoutOffersRepository;
  private readonly checkoutsRepository: CheckoutsRepository;
  private readonly offersRepository: OffersRepository;
  private readonly idGenerator: IdGenerator;
  private readonly clock: Clock;

  constructor(
    checkoutOffersRepository: CheckoutOffersRepository,
    checkoutsRepository: CheckoutsRepository,
    offersRepository: OffersRepository,
    idGenerator: IdGenerator,
    clock: Clock,
  ) {
    this.checkoutOffersRepository = checkoutOffersRepository;
    this.checkoutsRepository = checkoutsRepository;
    this.offersRepository = offersRepository;
    this.idGenerator = idGenerator;
    this.clock = clock;
  }

  async execute(input: LinkOfferToCheckoutInput): Promise<CheckoutOfferDto> {
    const checkout = await this.checkoutsRepository.findById(input.accountId, input.checkoutId);

    if (!checkout) {
      throw new CheckoutNotFoundError(input.checkoutId);
    }

    const offer = await this.offersRepository.findById(input.accountId, input.offerId);

    if (!offer) {
      throw new OfferNotFoundError(input.offerId);
    }

    if (offer.parentProductId !== checkout.soldProductId) {
      throw new OfferProductMismatchError(checkout.soldProductId, offer.parentProductId);
    }

    const existingLink = await this.checkoutOffersRepository.findByCheckoutAndOffer(
      input.accountId,
      input.checkoutId,
      input.offerId,
    );

    if (existingLink) {
      throw new OfferAlreadyLinkedError(input.checkoutId, input.offerId);
    }

    const checkoutOffer = CheckoutOffer.create({
      id: this.idGenerator.generate(),
      accountId: input.accountId,
      checkoutId: input.checkoutId,
      offerId: input.offerId,
      productId: checkout.soldProductId,
      publicSlug: await this.generateUniquePublicSlug(checkout),
      position: await this.checkoutOffersRepository.nextPosition(input.accountId, input.checkoutId),
      now: this.clock.now(),
    });

    await this.checkoutOffersRepository.create(checkoutOffer);

    return toCheckoutOfferDto(checkoutOffer);
  }

  /** O `unique(public_slug)` é a garantia final; aqui só evitamos o erro previsível. */
  private async generateUniquePublicSlug(checkout: Checkout): Promise<string> {
    for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt += 1) {
      const candidate = PublicSlug.generate(
        checkout.currentDisplayName,
        this.idGenerator.generate(),
      ).toString();

      if (!(await this.checkoutOffersRepository.existsByPublicSlug(candidate))) {
        return candidate;
      }
    }

    throw new InvariantViolationError(
      "Não foi possível gerar uma URL pública única para o vínculo",
    );
  }
}
