import { DefaultListNotificationsUseCase } from "@/application/notifications/use-cases/list-notifications.usecase";
import { DefaultMarkAllNotificationsAsReadUseCase } from "@/application/notifications/use-cases/mark-all-notifications-as-read.usecase";
import { DefaultMarkNotificationAsReadUseCase } from "@/application/notifications/use-cases/mark-notification-as-read.usecase";
import { getContainer } from "@/infra/di/container";
import { withPanelAccess } from "@/infra/di/factories/with-account-guard";
import { withErrorHandling } from "@/infra/di/factories/with-error-handling";
import {
  listNotificationsSchema,
  markNotificationAsReadSchema,
} from "@/infra/validation/zod/schemas/notification.schemas";
import { ZodValidator } from "@/infra/validation/zod/zod-validator.adapter";
import { ListNotificationsController } from "@/presentation/http/controllers/notifications/list-notifications.controller";
import { MarkAllNotificationsAsReadController } from "@/presentation/http/controllers/notifications/mark-all-notifications-as-read.controller";
import { MarkNotificationAsReadController } from "@/presentation/http/controllers/notifications/mark-notification-as-read.controller";

export function makeListNotificationsController() {
  const { notificationsRepository } = getContainer();

  return withErrorHandling(
    new ListNotificationsController(
      withPanelAccess(new DefaultListNotificationsUseCase(notificationsRepository)),
      new ZodValidator(listNotificationsSchema),
    ),
  );
}

export function makeMarkNotificationAsReadController() {
  const { notificationsRepository, clock } = getContainer();

  return withErrorHandling(
    new MarkNotificationAsReadController(
      withPanelAccess(new DefaultMarkNotificationAsReadUseCase(notificationsRepository, clock)),
      new ZodValidator(markNotificationAsReadSchema),
    ),
  );
}

export function makeMarkAllNotificationsAsReadController() {
  const { notificationsRepository, clock } = getContainer();

  return withErrorHandling(
    new MarkAllNotificationsAsReadController(
      withPanelAccess(new DefaultMarkAllNotificationsAsReadUseCase(notificationsRepository, clock)),
    ),
  );
}
