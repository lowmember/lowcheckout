import { OrderEvent } from "@/domain/orders/entities/order-event.entity";
import { Order } from "@/domain/orders/entities/order.entity";
import { toOrderStatus } from "@/domain/orders/value-objects/order-status";
import type {
  NewOrderEventRow,
  NewOrderRow,
  OrderRow,
} from "@/infra/persistence/drizzle/schema";

export function toOrder(row: OrderRow): Order {
  return Order.restore({
    id: row.id,
    accountId: row.accountId,
    checkoutOfferId: row.checkoutOfferId,
    checkoutId: row.checkoutId,
    offerId: row.offerId,
    productId: row.productId,
    buyerId: row.buyerId,
    status: toOrderStatus(row.status),
    amountInCents: row.amountInCents,
    currency: row.currency,
    productNameSnapshot: row.productNameSnapshot,
    offerNameSnapshot: row.offerNameSnapshot,
    deliveryUrlSnapshot: row.deliveryUrlSnapshot,
    buyerName: row.buyerName,
    buyerEmail: row.buyerEmail,
    buyerDocument: row.buyerDocument,
    expiresAt: row.expiresAt,
    paidAt: row.paidAt,
    deliverySentAt: row.deliverySentAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

export function toOrderRow(order: Order): NewOrderRow {
  const snapshot = order.toSnapshot();

  return {
    id: snapshot.id,
    accountId: snapshot.accountId,
    checkoutOfferId: snapshot.checkoutOfferId,
    checkoutId: snapshot.checkoutId,
    offerId: snapshot.offerId,
    productId: snapshot.productId,
    buyerId: snapshot.buyerId,
    status: snapshot.status,
    amountInCents: snapshot.amountInCents,
    currency: snapshot.currency,
    productNameSnapshot: snapshot.productNameSnapshot,
    offerNameSnapshot: snapshot.offerNameSnapshot,
    deliveryUrlSnapshot: snapshot.deliveryUrlSnapshot,
    buyerName: snapshot.buyerName,
    buyerEmail: snapshot.buyerEmail,
    buyerDocument: snapshot.buyerDocument,
    expiresAt: snapshot.expiresAt,
    paidAt: snapshot.paidAt,
    deliverySentAt: snapshot.deliverySentAt,
    createdAt: snapshot.createdAt,
    updatedAt: snapshot.updatedAt,
  };
}

export function toOrderEventRow(event: OrderEvent): NewOrderEventRow {
  const snapshot = event.toSnapshot();

  return {
    id: snapshot.id,
    accountId: snapshot.accountId,
    orderId: snapshot.orderId,
    fromStatus: snapshot.fromStatus,
    toStatus: snapshot.toStatus,
    reason: snapshot.reason,
    metadata: snapshot.metadata,
    occurredAt: snapshot.occurredAt,
  };
}
