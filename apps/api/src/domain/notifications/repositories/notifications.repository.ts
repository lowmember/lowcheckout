import type { Notification } from "@/domain/notifications/entities/notification.entity";
import type { AccountScopedQuery, Page } from "@/domain/shared/repositories/page";

export interface NotificationQuery extends AccountScopedQuery {
  /** `true` traz só as não lidas — é o que alimenta o contador do sino. */
  unreadOnly?: boolean;
}

/** Porta de persistência das notificações do painel. Sempre escopada por conta. */
export interface NotificationsRepository {
  findMany(query: NotificationQuery): Promise<Page<Notification>>;
  findById(accountId: string, notificationId: string): Promise<Notification | null>;
  countUnread(accountId: string): Promise<number>;
  create(notification: Notification): Promise<void>;
  update(notification: Notification): Promise<void>;
  /** Marca tudo o que ainda está por ler e devolve quantas mudaram. */
  markAllAsRead(accountId: string, now: Date): Promise<number>;
}
