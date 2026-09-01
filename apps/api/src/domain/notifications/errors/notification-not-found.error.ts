import { EntityNotFoundError } from "@/domain/shared/errors/domain.error";

export class NotificationNotFoundError extends EntityNotFoundError {
  override readonly code = "notification_not_found";

  constructor(notificationId: string) {
    super(`Notificação ${notificationId} não encontrada`);
  }
}
