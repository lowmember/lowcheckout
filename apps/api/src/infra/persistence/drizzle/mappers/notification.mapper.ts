import { Notification } from "@/domain/notifications/entities/notification.entity";
import { toNotificationType } from "@/domain/notifications/value-objects/notification-type";
import type { NewNotificationRow, NotificationRow } from "@/infra/persistence/drizzle/schema";

export function toNotification(row: NotificationRow): Notification {
  return Notification.restore({
    id: row.id,
    accountId: row.accountId,
    type: toNotificationType(row.type),
    title: row.title,
    body: row.body,
    orderId: row.orderId,
    checkoutId: row.checkoutId,
    readAt: row.readAt,
    createdAt: row.createdAt,
  });
}

export function toNotificationRow(notification: Notification): NewNotificationRow {
  const snapshot = notification.toSnapshot();

  return {
    id: snapshot.id,
    accountId: snapshot.accountId,
    type: snapshot.type,
    title: snapshot.title,
    body: snapshot.body,
    orderId: snapshot.orderId,
    checkoutId: snapshot.checkoutId,
    readAt: snapshot.readAt,
    createdAt: snapshot.createdAt,
  };
}
