import type { UseCase } from "@/application/shared/use-case";
import type { CheckoutOffersRepository } from "@/domain/checkouts/repositories/checkout-offers.repository";
import { OfferInUseError } from "@/domain/offers/errors/offer-in-use.error";
import { OfferNotFoundError } from "@/domain/offers/errors/offer-not-found.error";
import type { OffersRepository } from "@/domain/offers/repositories/offers.repository";
import type { OrdersRepository } from "@/domain/orders/repositories/orders.repository";

export interface DeleteOfferInput {
  accountId: string;
  offerId: string;
}

export type DeleteOfferUseCase = UseCase<DeleteOfferInput, void>;

export class DefaultDeleteOfferUseCase implements DeleteOfferUseCase {
  private readonly offersRepository: OffersRepository;
  private readonly checkoutOffersRepository: CheckoutOffersRepository;
  private readonly ordersRepository: OrdersRepository;

  constructor(
    offersRepository: OffersRepository,
    checkoutOffersRepository: CheckoutOffersRepository,
    ordersRepository: OrdersRepository,
  ) {
    this.offersRepository = offersRepository;
    this.checkoutOffersRepository = checkoutOffersRepository;
    this.ordersRepository = ordersRepository;
  }

  async execute({ accountId, offerId }: DeleteOfferInput): Promise<void> {
    const offer = await this.offersRepository.findById(accountId, offerId);

    if (!offer) {
      throw new OfferNotFoundError(offerId);
    }

    await this.assertNothingDependsOnIt(accountId, offerId);

    const deleted = await this.offersRepository.delete(accountId, offerId);

    if (!deleted) {
      throw new OfferNotFoundError(offerId);
    }
  }

  /**
   * Regra entre agregados: o vínculo com o checkout e o pedido referenciam a
   * oferta, então a deleção só passa com a oferta livre dos dois.
   */
  private async assertNothingDependsOnIt(accountId: string, offerId: string): Promise<void> {
    const [linkedCheckouts, orders] = await Promise.all([
      this.checkoutOffersRepository.countByOfferId(accountId, offerId),
      this.ordersRepository.countByOfferId(accountId, offerId),
    ]);

    if (linkedCheckouts > 0 || orders > 0) {
      throw new OfferInUseError(linkedCheckouts, orders);
    }
  }
}
