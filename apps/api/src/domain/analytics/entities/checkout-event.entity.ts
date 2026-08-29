import type { CheckoutEventType } from "@/domain/checkouts/value-objects/checkout-event-type";
import { InvariantViolationError } from "@/domain/shared/errors/domain.error";

/** Representação primitiva da entidade — é o que atravessa a fronteira do domínio. */
export interface CheckoutEventSnapshot {
  id: string;
  accountId: string;
  checkoutId: string;
  checkoutOfferId: string | null;
  orderId: string | null;
  type: CheckoutEventType;
  visitorId: string;
  utm: Record<string, unknown> | null;
  occurredAt: Date;
}

export interface CreateCheckoutEventProps {
  id: string;
  accountId: string;
  checkoutId: string;
  checkoutOfferId?: string | null;
  orderId?: string | null;
  type: CheckoutEventType;
  visitorId: string;
  utm?: Record<string, unknown> | null;
  now: Date;
}

const MAX_VISITOR_ID_LENGTH = 64;

/**
 * Matéria-prima do funil por checkout (RF-ANL-06). `visitorId` é anônimo e vem
 * do browser — nunca identifica a pessoa, só a sessão de navegação.
 */
export class CheckoutEvent {
  private readonly snapshot: CheckoutEventSnapshot;

  private constructor(snapshot: CheckoutEventSnapshot) {
    this.snapshot = snapshot;
  }

  static create(props: CreateCheckoutEventProps): CheckoutEvent {
    const visitorId = props.visitorId.trim();

    if (visitorId === "" || visitorId.length > MAX_VISITOR_ID_LENGTH) {
      throw new InvariantViolationError("Identificador de visitante inválido");
    }

    return new CheckoutEvent({
      id: props.id,
      accountId: props.accountId,
      checkoutId: props.checkoutId,
      checkoutOfferId: props.checkoutOfferId ?? null,
      orderId: props.orderId ?? null,
      type: props.type,
      visitorId,
      utm: props.utm ?? null,
      occurredAt: props.now,
    });
  }

  static restore(snapshot: CheckoutEventSnapshot): CheckoutEvent {
    return new CheckoutEvent(snapshot);
  }

  toSnapshot(): CheckoutEventSnapshot {
    return { ...this.snapshot };
  }
}
