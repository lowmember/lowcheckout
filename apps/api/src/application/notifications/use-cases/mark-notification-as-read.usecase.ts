import type { NotificationDto } from "@/application/notifications/dtos/notification.dto";
import { toNotificationDto } from "@/application/notifications/mappers/notification.mapper";
import type { Clock } from "@/application/shared/ports/clock";
import type { UseCase } from "@/application/shared/use-case";
import { NotificationNotFoundError } from "@/domain/notifications/errors/notification-not-found.error";
import type { NotificationsRepository } from "@/domain/notifications/repositories/notifications.repository";

export interface MarkNotificationAsReadInput {
  accountId: string;
  notificationId: string;
}

export type MarkNotificationAsReadUseCase = UseCase<MarkNotificationAsReadInput, NotificationDto>;

/** Idempotente: marcar de novo a mesma notificação não grava nada. */
export class DefaultMarkNotificationAsReadUseCase implements MarkNotificationAsReadUseCase {
  private readonly notificationsRepository: NotificationsRepository;
  private readonly clock: Clock;

  constructor(notificationsRepository: NotificationsRepository, clock: Clock) {
    this.notificationsRepository = notificationsRepository;
    this.clock = clock;
  }

  async execute({
    accountId,
    notificationId,
  }: MarkNotificationAsReadInput): Promise<NotificationDto> {
    const notification = await this.notificationsRepository.findById(accountId, notificationId);

    if (!notification) {
      throw new NotificationNotFoundError(notificationId);
    }

    if (notification.markAsRead(this.clock.now())) {
      await this.notificationsRepository.update(notification);
    }

    return toNotificationDto(notification);
  }
}
