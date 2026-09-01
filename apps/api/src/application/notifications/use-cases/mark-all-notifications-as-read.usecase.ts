import type { Clock } from "@/application/shared/ports/clock";
import type { UseCase } from "@/application/shared/use-case";
import type { NotificationsRepository } from "@/domain/notifications/repositories/notifications.repository";

export interface MarkAllNotificationsAsReadInput {
  accountId: string;
}

export interface MarkAllNotificationsAsReadOutput {
  markedAsRead: number;
}

export type MarkAllNotificationsAsReadUseCase = UseCase<
  MarkAllNotificationsAsReadInput,
  MarkAllNotificationsAsReadOutput
>;

/** "Marcar todas como lidas" do sino: zera o contador numa escrita só. */
export class DefaultMarkAllNotificationsAsReadUseCase implements MarkAllNotificationsAsReadUseCase {
  private readonly notificationsRepository: NotificationsRepository;
  private readonly clock: Clock;

  constructor(notificationsRepository: NotificationsRepository, clock: Clock) {
    this.notificationsRepository = notificationsRepository;
    this.clock = clock;
  }

  async execute({
    accountId,
  }: MarkAllNotificationsAsReadInput): Promise<MarkAllNotificationsAsReadOutput> {
    const markedAsRead = await this.notificationsRepository.markAllAsRead(
      accountId,
      this.clock.now(),
    );

    return { markedAsRead };
  }
}
