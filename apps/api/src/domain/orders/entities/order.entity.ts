import { InvalidOrderTransitionError } from "@/domain/orders/errors/invalid-order-transition.error";
import {
  canTransition,
  type OrderStatus,
  toOrderStatus,
} from "@/domain/orders/value-objects/order-status";
import { InvariantViolationError } from "@/domain/shared/errors/domain.error";
import { Money } from "@/domain/shared/value-objects/money";

/** Representação primitiva da entidade — é o que atravessa a fronteira do domínio. */
export interface OrderSnapshot {
  id: string;
  accountId: string;
  checkoutOfferId: string;
  checkoutId: string;
  offerId: string;
  productId: string;
  buyerId: string;
  status: OrderStatus;
  amountInCents: number;
  currency: string;
  productNameSnapshot: string;
  offerNameSnapshot: string;
  deliveryUrlSnapshot: string;
  buyerName: string;
  buyerEmail: string;
  buyerDocument: string;
  expiresAt: Date;
  paidAt: Date | null;
  deliverySentAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderProps {
  id: string;
  accountId: string;
  checkoutOfferId: string;
  checkoutId: string;
  offerId: string;
  productId: string;
  buyerId: string;
  amountInCents: number;
  currency: string;
  productNameSnapshot: string;
  offerNameSnapshot: string;
  deliveryUrlSnapshot: string;
  buyerName: string;
  buyerEmail: string;
  buyerDocument: string;
  expiresAt: Date;
  now: Date;
}

/** Uma transição que de fato aconteceu — é o que vira uma linha em `order_events`. */
export interface OrderTransition {
  from: OrderStatus;
  to: OrderStatus;
}

/**
 * O pedido nasce de um par (checkout, oferta) concreto. Todo campo `*Snapshot`
 * é **cópia** feita na compra (RF-PAG-06): editar a oferta depois não reescreve
 * o histórico de faturamento nem manda o comprador antigo para outro entregável.
 */
export class Order {
  private readonly id: string;
  private readonly accountId: string;
  private readonly checkoutOfferId: string;
  private readonly checkoutId: string;
  private readonly offerId: string;
  private readonly productId: string;
  private readonly buyerId: string;
  private status: OrderStatus;
  private readonly amount: Money;
  private readonly productNameSnapshot: string;
  private readonly offerNameSnapshot: string;
  private readonly deliveryUrlSnapshot: string;
  private readonly buyerName: string;
  private readonly buyerEmail: string;
  private readonly buyerDocument: string;
  private readonly expiresAt: Date;
  private paidAt: Date | null;
  private deliverySentAt: Date | null;
  private readonly createdAt: Date;
  private updatedAt: Date;

  private constructor(props: {
    snapshot: OrderSnapshot;
    amount: Money;
  }) {
    const { snapshot } = props;

    this.id = snapshot.id;
    this.accountId = snapshot.accountId;
    this.checkoutOfferId = snapshot.checkoutOfferId;
    this.checkoutId = snapshot.checkoutId;
    this.offerId = snapshot.offerId;
    this.productId = snapshot.productId;
    this.buyerId = snapshot.buyerId;
    this.status = snapshot.status;
    this.amount = props.amount;
    this.productNameSnapshot = snapshot.productNameSnapshot;
    this.offerNameSnapshot = snapshot.offerNameSnapshot;
    this.deliveryUrlSnapshot = snapshot.deliveryUrlSnapshot;
    this.buyerName = snapshot.buyerName;
    this.buyerEmail = snapshot.buyerEmail;
    this.buyerDocument = snapshot.buyerDocument;
    this.expiresAt = snapshot.expiresAt;
    this.paidAt = snapshot.paidAt;
    this.deliverySentAt = snapshot.deliverySentAt;
    this.createdAt = snapshot.createdAt;
    this.updatedAt = snapshot.updatedAt;
  }

  /** Todo pedido nasce em `awaiting_payment` (RF-PAG-01). */
  static create(props: CreateOrderProps): Order {
    const amount = Money.create(props.amountInCents, props.currency);

    if (!amount.isPositive()) {
      throw new InvariantViolationError("O valor do pedido deve ser maior que zero");
    }

    if (props.deliveryUrlSnapshot.trim() === "") {
      throw new InvariantViolationError(
        "O pedido precisa congelar a URL do entregável já resolvida",
      );
    }

    if (props.expiresAt.getTime() <= props.now.getTime()) {
      throw new InvariantViolationError("O prazo do PIX precisa ser no futuro");
    }

    return new Order({
      amount,
      snapshot: {
        id: props.id,
        accountId: props.accountId,
        checkoutOfferId: props.checkoutOfferId,
        checkoutId: props.checkoutId,
        offerId: props.offerId,
        productId: props.productId,
        buyerId: props.buyerId,
        status: "awaiting_payment",
        amountInCents: amount.cents,
        currency: amount.currency,
        productNameSnapshot: props.productNameSnapshot,
        offerNameSnapshot: props.offerNameSnapshot,
        deliveryUrlSnapshot: props.deliveryUrlSnapshot,
        buyerName: props.buyerName,
        buyerEmail: props.buyerEmail,
        buyerDocument: props.buyerDocument,
        expiresAt: props.expiresAt,
        paidAt: null,
        deliverySentAt: null,
        createdAt: props.now,
        updatedAt: props.now,
      },
    });
  }

  /** Reidrata a entidade a partir de um estado já persistido, sem reaplicar regras de criação. */
  static restore(snapshot: OrderSnapshot): Order {
    return new Order({
      amount: Money.create(snapshot.amountInCents, snapshot.currency),
      snapshot: { ...snapshot, status: toOrderStatus(snapshot.status) },
    });
  }

  get orderId(): string {
    return this.id;
  }

  get ownerAccountId(): string {
    return this.accountId;
  }

  get sourceCheckoutId(): string {
    return this.checkoutId;
  }

  get sourceCheckoutOfferId(): string {
    return this.checkoutOfferId;
  }

  get currentStatus(): OrderStatus {
    return this.status;
  }

  get isPaid(): boolean {
    return this.status === "paid";
  }

  get amountInCents(): number {
    return this.amount.cents;
  }

  get deliveryUrl(): string {
    return this.deliveryUrlSnapshot;
  }

  get buyerEmailAddress(): string {
    return this.buyerEmail;
  }

  get wasDeliverySent(): boolean {
    return this.deliverySentAt !== null;
  }

  isExpirable(now: Date): boolean {
    return this.status === "awaiting_payment" && this.expiresAt.getTime() <= now.getTime();
  }

  /**
   * RF-PAG-04. Devolve `null` quando o pedido **já** estava pago: é assim que o
   * webhook reentregue não reexecuta efeito nenhum (RF-GTW-02).
   */
  markAsPaid(paidAt: Date, now: Date): OrderTransition | null {
    if (this.status === "paid") {
      return null;
    }

    return this.transitionTo("paid", now, () => {
      this.paidAt = paidAt;
    });
  }

  /**
   * RF-PAG-03. `null` quando o pedido já saiu de `awaiting_payment` — inclusive
   * quando já está pago, que é terminal e vence a expiração.
   */
  markAsExpired(now: Date): OrderTransition | null {
    if (this.status !== "awaiting_payment") {
      return null;
    }

    return this.transitionTo("expired", now);
  }

  /** RF-PAG-05: exatamente um e-mail de entrega por pedido aprovado. */
  markDeliverySent(now: Date): boolean {
    if (this.deliverySentAt !== null) {
      return false;
    }

    this.deliverySentAt = now;
    this.updatedAt = now;

    return true;
  }

  toSnapshot(): OrderSnapshot {
    return {
      id: this.id,
      accountId: this.accountId,
      checkoutOfferId: this.checkoutOfferId,
      checkoutId: this.checkoutId,
      offerId: this.offerId,
      productId: this.productId,
      buyerId: this.buyerId,
      status: this.status,
      amountInCents: this.amount.cents,
      currency: this.amount.currency,
      productNameSnapshot: this.productNameSnapshot,
      offerNameSnapshot: this.offerNameSnapshot,
      deliveryUrlSnapshot: this.deliveryUrlSnapshot,
      buyerName: this.buyerName,
      buyerEmail: this.buyerEmail,
      buyerDocument: this.buyerDocument,
      expiresAt: this.expiresAt,
      paidAt: this.paidAt,
      deliverySentAt: this.deliverySentAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  private transitionTo(to: OrderStatus, now: Date, apply?: () => void): OrderTransition {
    if (!canTransition(this.status, to)) {
      throw new InvalidOrderTransitionError(this.status, to);
    }

    const from = this.status;

    this.status = to;
    apply?.();
    this.updatedAt = now;

    return { from, to };
  }
}
