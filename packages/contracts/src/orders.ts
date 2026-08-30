export const ORDER_STATUSES = [
  "awaiting_payment",
  "paid",
  "expired",
  "canceled",
  "refunded",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

/**
 * Os campos `*Snapshot` são os dados congelados na compra (RF-PAG-06), não o
 * estado atual do catálogo: é isso que mantém a tela de vendas correta depois
 * de o lojista editar produto ou oferta.
 */
export interface Order {
  id: string;
  checkoutId: string;
  offerId: string;
  productId: string;
  status: OrderStatus;
  amountInCents: number;
  currency: string;
  productNameSnapshot: string;
  offerNameSnapshot: string;
  buyerName: string;
  buyerEmail: string;
  /** Só dígitos. */
  buyerDocument: string;
  /** Sempre presente: todo pedido nasce com prazo de PIX. */
  expiresAt: string;
  paidAt: string | null;
  createdAt: string;
}
