import type { NotificationDto } from "@/application/notifications/dtos/notification.dto";
import { toNotificationDto } from "@/application/notifications/mappers/notification.mapper";
import type { PageDto } from "@/application/shared/dtos/page.dto";
import type { UseCase } from "@/application/shared/use-case";
import type { NotificationsRepository } from "@/domain/notifications/repositories/notifications.repository";

export interface ListNotificationsInput {
  accountId: string;
  page: number;
  perPage: number;
  status: "unread" | "all";
}

export type ListNotificationsUseCase = UseCase<ListNotificationsInput, PageDto<NotificationDto>>;

/** Sino do painel: os avisos da conta, do mais recente para o mais antigo. */
export class DefaultListNotificationsUseCase implements ListNotificationsUseCase {
  private readonly notificationsRepository: NotificationsRepository;

  constructor(notificationsRepository: NotificationsRepository) {
    this.notificationsRepository = notificationsRepository;
  }

  async execute(input: ListNotificationsInput): Promise<PageDto<NotificationDto>> {
    const { items, total } = await this.notificationsRepository.findMany({
      accountId: input.accountId,
      page: input.page,
      perPage: input.perPage,
      unreadOnly: input.status === "unread",
    });

    return {
      data: items.map(toNotificationDto),
      meta: { page: input.page, perPage: input.perPage, total },
    };
  }
}
