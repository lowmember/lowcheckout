import type { GatewayProvider } from "@/domain/gateways/value-objects/gateway-provider";
import type { PaymentMethod } from "@/domain/payments/value-objects/payment-method";
import type { PaymentStatus } from "@/domain/payments/value-objects/payment-status";

/** Representação primitiva da entidade — é o que atravessa a fronteira do domínio. */
export interface PaymentSnapshot {
  id: string;
  accountId: string;
  orderId: string;
  provider: GatewayProvider;
  method: PaymentMethod;
  status: PaymentStatus;
  externalChargeId: string;
  amountInCents: number;
  qrCodeImageUrl: string | null;
  qrCodePayload: string | null;
  expiresAt: Date;
  paidAt: Date | null;
  rawPayload: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentProps {
  id: string;
  accountId: string;
  orderId: string;
  provider: GatewayProvider;
  method: PaymentMethod;
  externalChargeId: string;
  amountInCents: number;
  qrCodeImageUrl: string | null;
  qrCodePayload: string | null;
  expiresAt: Date;
  rawPayload: Record<string, unknown>;
  now: Date;
}

/**
 * Uma cobrança concreta no provedor. É 1:N com o pedido, não 1:1 — um PIX
 * expirado pode ser regerado —, mas o índice parcial
 * `unique(order_id) where status = 'pending'` garante um único PIX vivo por vez.
 */
export class Payment {
  private readonly id: string;
  private readonly accountId: string;
  private readonly orderId: string;
  private readonly provider: GatewayProvider;
  private readonly method: PaymentMethod;
  private status: PaymentStatus;
  private readonly externalChargeId: string;
  private readonly amountInCents: number;
  private readonly qrCodeImageUrl: string | null;
  private readonly qrCodePayload: string | null;
  private readonly expiresAt: Date;
  private paidAt: Date | null;
  private rawPayload: Record<string, unknown>;
  private readonly createdAt: Date;
  private updatedAt: Date;

  private constructor(snapshot: PaymentSnapshot) {
    this.id = snapshot.id;
    this.accountId = snapshot.accountId;
    this.orderId = snapshot.orderId;
    this.provider = snapshot.provider;
    this.method = snapshot.method;
    this.status = snapshot.status;
    this.externalChargeId = snapshot.externalChargeId;
    this.amountInCents = snapshot.amountInCents;
    this.qrCodeImageUrl = snapshot.qrCodeImageUrl;
    this.qrCodePayload = snapshot.qrCodePayload;
    this.expiresAt = snapshot.expiresAt;
    this.paidAt = snapshot.paidAt;
    this.rawPayload = snapshot.rawPayload;
    this.createdAt = snapshot.createdAt;
    this.updatedAt = snapshot.updatedAt;
  }

  static create(props: CreatePaymentProps): Payment {
    return new Payment({
      id: props.id,
      accountId: props.accountId,
      orderId: props.orderId,
      provider: props.provider,
      method: props.method,
      status: "pending",
      externalChargeId: props.externalChargeId,
      amountInCents: props.amountInCents,
      qrCodeImageUrl: props.qrCodeImageUrl,
      qrCodePayload: props.qrCodePayload,
      expiresAt: props.expiresAt,
      paidAt: null,
      rawPayload: props.rawPayload,
      createdAt: props.now,
      updatedAt: props.now,
    });
  }

  /** Reidrata a entidade a partir de um estado já persistido, sem reaplicar regras de criação. */
  static restore(snapshot: PaymentSnapshot): Payment {
    return new Payment(snapshot);
  }

  get paymentId(): string {
    return this.id;
  }

  get relatedOrderId(): string {
    return this.orderId;
  }

  get currentStatus(): PaymentStatus {
    return this.status;
  }

  get charge(): { payload: string | null; imageUrl: string | null; expiresAt: Date } {
    return {
      payload: this.qrCodePayload,
      imageUrl: this.qrCodeImageUrl,
      expiresAt: this.expiresAt,
    };
  }

  markAsPaid(paidAt: Date, rawPayload: Record<string, unknown>, now: Date): boolean {
    if (this.status === "paid") {
      return false;
    }

    this.status = "paid";
    this.paidAt = paidAt;
    this.rawPayload = rawPayload;
    this.updatedAt = now;

    return true;
  }

  markAsExpired(now: Date): boolean {
    if (this.status !== "pending") {
      return false;
    }

    this.status = "expired";
    this.updatedAt = now;

    return true;
  }

  toSnapshot(): PaymentSnapshot {
    return {
      id: this.id,
      accountId: this.accountId,
      orderId: this.orderId,
      provider: this.provider,
      method: this.method,
      status: this.status,
      externalChargeId: this.externalChargeId,
      amountInCents: this.amountInCents,
      qrCodeImageUrl: this.qrCodeImageUrl,
      qrCodePayload: this.qrCodePayload,
      expiresAt: this.expiresAt,
      paidAt: this.paidAt,
      rawPayload: this.rawPayload,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
