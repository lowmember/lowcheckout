export const NOTIFICATION_TYPES = ["sale_created", "sale_paid", "sale_expired"] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

/**
 * Aviso do sino do painel (RF-NOT-01). Título e corpo já vêm prontos da API:
 * a notificação é o registro do que aconteceu, não uma consulta ao pedido.
 */
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  orderId: string | null;
  checkoutId: string | null;
  readAt: string | null;
  createdAt: string;
}
