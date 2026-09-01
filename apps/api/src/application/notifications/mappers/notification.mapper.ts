import type { NotificationDto } from "@/application/notifications/dtos/notification.dto";
import type { Notification } from "@/domain/notifications/entities/notification.entity";

export function toNotificationDto(notification: Notification): NotificationDto {
  const snapshot = notification.toSnapshot();

  return {
    id: snapshot.id,
    type: snapshot.type,
    title: snapshot.title,
    body: snapshot.body,
    orderId: snapshot.orderId,
    checkoutId: snapshot.checkoutId,
    readAt: snapshot.readAt?.toISOString() ?? null,
    createdAt: snapshot.createdAt.toISOString(),
  };
}
