import type { OrderStatus } from "@/domain/orders/value-objects/order-status";

/** Representação primitiva da entidade — é o que atravessa a fronteira do domínio. */
export interface OrderEventSnapshot {
  id: string;
  accountId: string;
  orderId: string;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  reason: string | null;
  metadata: Record<string, unknown>;
  occurredAt: Date;
}

export interface CreateOrderEventProps {
  id: string;
  accountId: string;
  orderId: string;
  fromStatus?: OrderStatus | null;
  toStatus: OrderStatus;
  reason?: string | null;
  metadata?: Record<string, unknown>;
  now: Date;
}

/**
 * Trilha append-only das transições do pedido. `fromStatus` é nulo no evento de
 * criação. `reason` importa sobretudo no caso `expired → paid`, em que o
 * webhook chega depois do job de expiração.
 */
export class OrderEvent {
  private readonly snapshot: OrderEventSnapshot;

  private constructor(snapshot: OrderEventSnapshot) {
    this.snapshot = snapshot;
  }

  static create(props: CreateOrderEventProps): OrderEvent {
    return new OrderEvent({
      id: props.id,
      accountId: props.accountId,
      orderId: props.orderId,
      fromStatus: props.fromStatus ?? null,
      toStatus: props.toStatus,
      reason: props.reason ?? null,
      metadata: props.metadata ?? {},
      occurredAt: props.now,
    });
  }

  static restore(snapshot: OrderEventSnapshot): OrderEvent {
    return new OrderEvent(snapshot);
  }

  toSnapshot(): OrderEventSnapshot {
    return { ...this.snapshot };
  }
}
