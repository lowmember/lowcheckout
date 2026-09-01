export type NotificationType = "sale_created" | "sale_paid" | "sale_expired";

/** Aviso do sino do painel (RF-NOT-01). Título e corpo já vêm prontos da API. */
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

export interface ListNotificationsParams {
  page?: number;
  perPage?: number;
  /** `unread` alimenta o contador do sino; ausente traz tudo. */
  status?: "unread" | "all";
}
