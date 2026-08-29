import type { OrderDto } from "@/application/orders/dtos/order.dto";
import type { Order } from "@/domain/orders/entities/order.entity";

export function toOrderDto(order: Order): OrderDto {
  const snapshot = order.toSnapshot();

  return {
    id: snapshot.id,
    checkoutId: snapshot.checkoutId,
    offerId: snapshot.offerId,
    productId: snapshot.productId,
    status: snapshot.status,
    amountInCents: snapshot.amountInCents,
    currency: snapshot.currency,
    productNameSnapshot: snapshot.productNameSnapshot,
    offerNameSnapshot: snapshot.offerNameSnapshot,
    buyerName: snapshot.buyerName,
    buyerEmail: snapshot.buyerEmail,
    buyerDocument: snapshot.buyerDocument,
    expiresAt: snapshot.expiresAt.toISOString(),
    paidAt: snapshot.paidAt?.toISOString() ?? null,
    createdAt: snapshot.createdAt.toISOString(),
  };
}
