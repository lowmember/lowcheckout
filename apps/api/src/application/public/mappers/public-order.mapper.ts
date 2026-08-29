import type {
  PublicOrderDto,
  PublicOrderPixDto,
  PublicOrderStatusDto,
} from "@/application/public/dtos/public-order.dto";
import type { Order } from "@/domain/orders/entities/order.entity";
import type { Payment } from "@/domain/payments/entities/payment.entity";

export function toPublicOrderDto(order: Order, payment: Payment | null): PublicOrderDto {
  const snapshot = order.toSnapshot();

  return {
    id: snapshot.id,
    status: snapshot.status,
    amountInCents: snapshot.amountInCents,
    currency: snapshot.currency,
    productName: snapshot.productNameSnapshot,
    offerName: snapshot.offerNameSnapshot,
    buyerName: snapshot.buyerName,
    expiresAt: snapshot.expiresAt.toISOString(),
    paidAt: snapshot.paidAt?.toISOString() ?? null,
    pix: payment ? toPublicOrderPixDto(payment) : null,
    // O acesso ao entregável só existe para pedido pago (RF-PUB-06).
    deliveryUrl: order.isPaid ? snapshot.deliveryUrlSnapshot : null,
  };
}

export function toPublicOrderStatusDto(order: Order): PublicOrderStatusDto {
  const snapshot = order.toSnapshot();

  return {
    id: snapshot.id,
    status: snapshot.status,
    expiresAt: snapshot.expiresAt.toISOString(),
    paidAt: snapshot.paidAt?.toISOString() ?? null,
  };
}

function toPublicOrderPixDto(payment: Payment): PublicOrderPixDto {
  const { payload, imageUrl, expiresAt } = payment.charge;

  return {
    qrCodePayload: payload,
    qrCodeImageUrl: imageUrl,
    expiresAt: expiresAt.toISOString(),
  };
}
