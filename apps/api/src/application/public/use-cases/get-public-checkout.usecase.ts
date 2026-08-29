import type { PublicCheckoutDto } from "@/application/public/dtos/public-checkout.dto";
import type { Clock } from "@/application/shared/ports/clock";
import type { IdGenerator } from "@/application/shared/ports/id-generator";
import type { Logger } from "@/application/shared/ports/logger";
import type { UseCase } from "@/application/shared/use-case";
import { CheckoutEvent } from "@/domain/analytics/entities/checkout-event.entity";
import type { CheckoutEventsRepository } from "@/domain/analytics/repositories/checkout-events.repository";
import { PublicCheckoutUnavailableError } from "@/domain/checkouts/errors/public-checkout-unavailable.error";
import type { PublicCheckoutRepository } from "@/domain/checkouts/repositories/public-checkout.repository";
import type { GatewayConnectionsRepository } from "@/domain/gateways/repositories/gateway-connections.repository";

export interface GetPublicCheckoutInput {
  publicSlug: string;
  /** Anônimo, vindo do browser; geramos um quando é a primeira visita. */
  visitorId?: string | null;
}

export type GetPublicCheckoutUseCase = UseCase<GetPublicCheckoutInput, PublicCheckoutDto>;

/**
 * RF-PUB-01. Resolve a URL pública e devolve só o necessário para comprar.
 * De quebra, registra o `page_view` que alimenta o funil (RF-PUB-08, S21) —
 * falhar nesse registro **não** pode derrubar a página que converte.
 */
export class DefaultGetPublicCheckoutUseCase implements GetPublicCheckoutUseCase {
  private readonly publicCheckoutRepository: PublicCheckoutRepository;
  private readonly gatewayConnectionsRepository: GatewayConnectionsRepository;
  private readonly checkoutEventsRepository: CheckoutEventsRepository;
  private readonly idGenerator: IdGenerator;
  private readonly clock: Clock;
  private readonly logger: Logger;

  constructor(
    publicCheckoutRepository: PublicCheckoutRepository,
    gatewayConnectionsRepository: GatewayConnectionsRepository,
    checkoutEventsRepository: CheckoutEventsRepository,
    idGenerator: IdGenerator,
    clock: Clock,
    logger: Logger,
  ) {
    this.publicCheckoutRepository = publicCheckoutRepository;
    this.gatewayConnectionsRepository = gatewayConnectionsRepository;
    this.checkoutEventsRepository = checkoutEventsRepository;
    this.idGenerator = idGenerator;
    this.clock = clock;
    this.logger = logger;
  }

  async execute({ publicSlug, visitorId }: GetPublicCheckoutInput): Promise<PublicCheckoutDto> {
    const view = await this.publicCheckoutRepository.findByPublicSlug(publicSlug);

    // Vínculo inativo, conta suspensa ou excluída respondem igual a inexistente:
    // distinguir os casos vazaria a existência de recurso de outra conta.
    const link = view?.checkoutOffer.toSnapshot();

    if (!view || link?.isActive !== true || !view.account.canSell) {
      throw new PublicCheckoutUnavailableError();
    }

    const connection = await this.gatewayConnectionsRepository.findByAccount(
      view.account.accountId,
    );

    const checkout = view.checkout.toSnapshot();
    const product = view.product.toSnapshot();
    const offer = view.offer.toSnapshot();
    const resolvedVisitorId = this.resolveVisitorId(visitorId);

    await this.registerPageView(view, resolvedVisitorId);

    return {
      publicSlug,
      displayName: checkout.displayName,
      bannerDesktopUrl: checkout.bannerDesktopUrl,
      bannerMobileUrl: checkout.bannerMobileUrl,
      customization: checkout.customization,
      product: {
        name: product.name,
        description: product.description,
        imageUrl: product.imageUrl,
      },
      offer: { priceInCents: offer.priceInCents, currency: offer.currency },
      paymentAvailable: connection?.isConnected === true,
      pixels: view.pixels
        .filter((pixel) => pixel.enabled)
        .map((pixel) => ({
          provider: pixel.pixelProvider,
          externalId: pixel.currentExternalId,
        })),
      visitorId: resolvedVisitorId,
    };
  }

  private resolveVisitorId(visitorId: string | null | undefined): string {
    const trimmed = visitorId?.trim();

    return trimmed === undefined || trimmed === "" || trimmed.length > 64
      ? this.idGenerator.generate()
      : trimmed;
  }

  private async registerPageView(
    view: Awaited<ReturnType<PublicCheckoutRepository["findByPublicSlug"]>> & object,
    visitorId: string,
  ): Promise<void> {
    try {
      await this.checkoutEventsRepository.create(
        CheckoutEvent.create({
          id: this.idGenerator.generate(),
          accountId: view.account.accountId,
          checkoutId: view.checkout.checkoutId,
          checkoutOfferId: view.checkoutOffer.checkoutOfferId,
          type: "page_view",
          visitorId,
          now: this.clock.now(),
        }),
      );
    } catch (error) {
      this.logger.error("checkout_event_write_failed", {
        type: "page_view",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
