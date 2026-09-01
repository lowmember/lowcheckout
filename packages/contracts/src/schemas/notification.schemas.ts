import { z } from "zod";

import { idSchema, paginationSchema } from "./shared.schemas";

export const listNotificationsSchema = paginationSchema.extend({
  /** `unread` alimenta o contador do sino; ausente traz tudo. */
  status: z.enum(["unread", "all"]).default("all"),
});

export const markNotificationAsReadSchema = z.object({
  notificationId: idSchema,
});

export type ListNotificationsParams = z.input<typeof listNotificationsSchema>;
