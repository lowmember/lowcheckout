/** Ciclo de vida do pedido (RF-PAG-02). */
export type OrderStatus = "awaiting_payment" | "paid" | "expired" | "canceled" | "refunded";

export interface Order {
  id: string;
  checkoutId: string;
  offerId: string;
  productId: string;
  status: OrderStatus;
  amountInCents: number;
  currency: string;
  /** Dados congelados no momento da compra (RF-PAG-06). */
  productNameSnapshot: string;
  offerNameSnapshot: string;
  buyerName: string;
  buyerEmail: string;
  /** Só dígitos. Nunca exibido integralmente em listagem (LGPD). */
  buyerDocument: string;
  expiresAt: string | null;
  paidAt: string | null;
  createdAt: string;
}

export interface ListOrdersParams {
  page?: number;
  perPage?: number;
  status?: OrderStatus;
  search?: string;
}
