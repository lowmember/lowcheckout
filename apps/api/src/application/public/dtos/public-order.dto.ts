import type { OrderStatus } from "@/domain/orders/value-objects/order-status";

/** Tela do PIX (RF-PUB-04). */
export interface PublicOrderPixDto {
  qrCodePayload: string | null;
  qrCodeImageUrl: string | null;
  expiresAt: string;
}

export interface PublicOrderDto {
  id: string;
  status: OrderStatus;
  amountInCents: number;
  currency: string;
  productName: string;
  offerName: string;
  buyerName: string;
  expiresAt: string;
  paidAt: string | null;
  pix: PublicOrderPixDto | null;
  /**
   * Só é preenchido quando o pedido está **pago** (RF-PUB-06): acessar a tela
   * de obrigado de um pedido não pago não pode entregar o produto.
   */
  deliveryUrl: string | null;
}

/** Resposta enxuta do polling da tela do PIX (RF-PUB-05). */
export interface PublicOrderStatusDto {
  id: string;
  status: OrderStatus;
  expiresAt: string;
  paidAt: string | null;
}
