import type { PaymentGateway } from "@/application/payments/ports/payment-gateway";
import type { PublicOrderDto } from "@/application/public/dtos/public-order.dto";
import { toPublicOrderDto } from "@/application/public/mappers/public-order.mapper";
import type { Clock } from "@/application/shared/ports/clock";
import type { Encrypter } from "@/application/shared/ports/encrypter";
import type { IdGenerator } from "@/application/shared/ports/id-generator";
import type { Logger } from "@/application/shared/ports/logger";
import type { UseCase } from "@/application/shared/use-case";
import { CheckoutEvent } from "@/domain/analytics/entities/checkout-event.entity";
import type { CheckoutEventsRepository } from "@/domain/analytics/repositories/checkout-events.repository";
import { Buyer } from "@/domain/buyers/entities/buyer.entity";
import type { BuyersRepository } from "@/domain/buyers/repositories/buyers.repository";
import { PublicCheckoutUnavailableError } from "@/domain/checkouts/errors/public-checkout-unavailable.error";
import type {
  PublicCheckoutRepository,
  PublicCheckoutView,
} from "@/domain/checkouts/repositories/public-checkout.repository";
import { GatewayNotConnectedError } from "@/domain/gateways/errors/gateway-not-connected.error";
import type { GatewayConnectionsRepository } from "@/domain/gateways/repositories/gateway-connections.repository";
import { GatewayCredentials } from "@/domain/gateways/value-objects/gateway-credentials";
import { resolveDeliveryUrl } from "@/domain/offers/policies/deliverable.policy";
import { Order } from "@/domain/orders/entities/order.entity";
import { OrderEvent } from "@/domain/orders/entities/order-event.entity";
import type { OrderEventsRepository } from "@/domain/orders/repositories/order-events.repository";
import type { OrdersRepository } from "@/domain/orders/repositories/orders.repository";
import { Payment } from "@/domain/payments/entities/payment.entity";
import type { PaymentsRepository } from "@/domain/payments/repositories/payments.repository";
import { InvariantViolationError } from "@/domain/shared/errors/domain.error";
import { Document } from "@/domain/shared/value-objects/document";
import { Email } from "@/domain/shared/value-objects/email";

export interface CreatePublicOrderInput {
  publicSlug: string;
  buyerName: string;
  buyerEmail: string;
  buyerDocument: string;
  visitorId?: string | null;
}

export type CreatePublicOrderUseCase = UseCase<CreatePublicOrderInput, PublicOrderDto>;

/**
 * RF-PUB-02/03 + RF-PAG-01. A ordem das etapas é a regra: a cobrança é criada no
 * provedor **antes** de qualquer escrita, para que uma falha do gateway não
 * deixe pedido pendente inconsistente no analytics (RF-PAG-01).
 */
export class DefaultCreatePublicOrderUseCase implements CreatePublicOrderUseCase {
  private readonly publicCheckoutRepository: PublicCheckoutRepository;
  private readonly gatewayConnectionsRepository: GatewayConnectionsRepository;
  private readonly buyersRepository: BuyersRepository;
  private readonly ordersRepository: OrdersRepository;
  private readonly orderEventsRepository: OrderEventsRepository;
  private readonly paymentsRepository: PaymentsRepository;
  private readonly checkoutEventsRepository: CheckoutEventsRepository;
  private readonly paymentGateway: PaymentGateway;
  private readonly encrypter: Encrypter;
  private readonly idGenerator: IdGenerator;
  private readonly clock: Clock;
  private readonly logger: Logger;
  private readonly pixExpirationSeconds: number;

  constructor(
    publicCheckoutRepository: PublicCheckoutRepository,
    gatewayConnectionsRepository: GatewayConnectionsRepository,
    buyersRepository: BuyersRepository,
    ordersRepository: OrdersRepository,
    orderEventsRepository: OrderEventsRepository,
    paymentsRepository: PaymentsRepository,
    checkoutEventsRepository: CheckoutEventsRepository,
    paymentGateway: PaymentGateway,
    encrypter: Encrypter,
    idGenerator: IdGenerator,
    clock: Clock,
    logger: Logger,
    pixExpirationSeconds: number,
  ) {
    this.publicCheckoutRepository = publicCheckoutRepository;
    this.gatewayConnectionsRepository = gatewayConnectionsRepository;
    this.buyersRepository = buyersRepository;
    this.ordersRepository = ordersRepository;
    this.orderEventsRepository = orderEventsRepository;
    this.paymentsRepository = paymentsRepository;
    this.checkoutEventsRepository = checkoutEventsRepository;
    this.paymentGateway = paymentGateway;
    this.encrypter = encrypter;
    this.idGenerator = idGenerator;
    this.clock = clock;
    this.logger = logger;
    this.pixExpirationSeconds = pixExpirationSeconds;
  }

  async execute(input: CreatePublicOrderInput): Promise<PublicOrderDto> {
    const view = await this.publicCheckoutRepository.findByPublicSlug(input.publicSlug);

    // Vínculo inativo, conta suspensa ou excluída respondem igual a inexistente:
    // distinguir os casos vazaria a existência de recurso de outra conta.
    const link = view?.checkoutOffer.toSnapshot();

    if (!view || link?.isActive !== true || !view.account.canSell) {
      throw new PublicCheckoutUnavailableError();
    }

    const connection = await this.gatewayConnectionsRepository.findByAccount(
      view.account.accountId,
    );
    const encryptedCredentials = connection?.currentEncryptedCredentials;

    if (!connection?.isConnected || !encryptedCredentials || !connection.currentPixKey) {
      throw new GatewayNotConnectedError();
    }

    // Formato dos dados do comprador (RF-PUB-02): normalizados pelos value objects.
    const buyerEmail = Email.create(input.buyerEmail);
    const buyerDocument = Document.createCpf(input.buyerDocument);

    const offer = view.offer.toSnapshot();
    const product = view.product.toSnapshot();
    const deliveryUrl = resolveDeliveryUrl(offer.deliveryUrl, product.defaultDeliveryUrl);

    if (!deliveryUrl) {
      // Invariante (c) garante que isto não acontece; se acontecer, é bug nosso.
      throw new InvariantViolationError("A oferta não tem entregável definido");
    }

    const now = this.clock.now();
    const orderId = this.idGenerator.generate();

    const charge = await this.paymentGateway.createPixCharge(
      {
        environment: connection.currentEnvironment,
        credentials: GatewayCredentials.fromDecrypted(
          JSON.parse(this.encrypter.decrypt(encryptedCredentials)),
        ),
      },
      {
        orderId,
        amountInCents: offer.priceInCents,
        expiresInSeconds: this.pixExpirationSeconds,
        description: `${product.name} - ${view.checkout.currentDisplayName}`,
        payer: { name: input.buyerName, document: buyerDocument.toString() },
        pixKey: connection.currentPixKey,
      },
    );

    const buyer = await this.resolveBuyer(
      view.account.accountId,
      { name: input.buyerName, email: buyerEmail.toString(), document: buyerDocument.toString() },
      now,
    );

    const order = Order.create({
      id: orderId,
      accountId: view.account.accountId,
      checkoutOfferId: view.checkoutOffer.checkoutOfferId,
      checkoutId: view.checkout.checkoutId,
      offerId: offer.id,
      productId: product.id,
      buyerId: buyer.buyerId,
      amountInCents: offer.priceInCents,
      currency: offer.currency,
      // Congelados na compra (RF-PAG-06).
      productNameSnapshot: product.name,
      offerNameSnapshot: offer.name,
      deliveryUrlSnapshot: deliveryUrl,
      buyerName: buyer.currentName,
      buyerEmail: buyer.currentEmail,
      buyerDocument: buyer.currentDocument,
      expiresAt: charge.expiresAt,
      now,
    });

    await this.ordersRepository.create(order);

    const payment = Payment.create({
      id: this.idGenerator.generate(),
      accountId: view.account.accountId,
      orderId: order.orderId,
      provider: this.paymentGateway.provider,
      method: "pix",
      externalChargeId: charge.externalChargeId,
      amountInCents: offer.priceInCents,
      qrCodeImageUrl: charge.qrCodeImageUrl,
      qrCodePayload: charge.qrCodePayload,
      expiresAt: charge.expiresAt,
      rawPayload: charge.rawPayload,
      now,
    });

    await this.paymentsRepository.create(payment);

    await this.orderEventsRepository.create(
      OrderEvent.create({
        id: this.idGenerator.generate(),
        accountId: view.account.accountId,
        orderId: order.orderId,
        toStatus: order.currentStatus,
        reason: "Pedido criado com cobrança PIX gerada",
        metadata: { externalChargeId: charge.externalChargeId },
        now,
      }),
    );

    await this.registerPixGenerated(view, order, input.visitorId, now);

    return toPublicOrderDto(order, payment);
  }

  /** Mesmo e-mail na conta é o mesmo comprador; os dados mais recentes prevalecem. */
  private async resolveBuyer(
    accountId: string,
    data: { name: string; email: string; document: string },
    now: Date,
  ): Promise<Buyer> {
    const existing = await this.buyersRepository.findByAccountAndEmail(accountId, data.email);

    if (existing) {
      existing.refresh(data.name, data.document, now);

      await this.buyersRepository.update(existing);

      return existing;
    }

    const buyer = Buyer.create({
      id: this.idGenerator.generate(),
      accountId,
      name: data.name,
      email: data.email,
      document: data.document,
      now,
    });

    await this.buyersRepository.create(buyer);

    return buyer;
  }

  private async registerPixGenerated(
    view: PublicCheckoutView,
    order: Order,
    visitorId: string | null | undefined,
    now: Date,
  ): Promise<void> {
    try {
      await this.checkoutEventsRepository.create(
        CheckoutEvent.create({
          id: this.idGenerator.generate(),
          accountId: view.account.accountId,
          checkoutId: view.checkout.checkoutId,
          checkoutOfferId: view.checkoutOffer.checkoutOfferId,
          orderId: order.orderId,
          type: "pix_generated",
          visitorId: visitorId?.trim() || this.idGenerator.generate(),
          now,
        }),
      );
    } catch (error) {
      // O funil é diagnóstico: não pode custar uma venda já cobrada.
      this.logger.error("checkout_event_write_failed", {
        type: "pix_generated",
        orderId: order.orderId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
