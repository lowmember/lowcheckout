import { queryOptions } from "@tanstack/react-query";

import { listNotifications } from "@/features/notifications/api/notifications.api";
import type { ListNotificationsParams } from "@/features/notifications/types/notification";

/** O sino consulta o painel inteiro a cada minuto: mais que isso não muda a decisão. */
const UNREAD_POLL_INTERVAL_IN_MS = 60_000;

export const notificationKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationKeys.all, "list"] as const,
  list: (params: ListNotificationsParams) => [...notificationKeys.lists(), params] as const,
};

const UNREAD_COUNT_PARAMS: ListNotificationsParams = { status: "unread", perPage: 1 };

export const notificationQueries = {
  list: (params: ListNotificationsParams = {}) =>
    queryOptions({
      queryKey: notificationKeys.list(params),
      queryFn: () => listNotifications(params),
    }),

  /** Só o total importa aqui — `perPage: 1` evita trazer a lista inteira atrás dele. */
  unreadCount: () =>
    queryOptions({
      queryKey: notificationKeys.list(UNREAD_COUNT_PARAMS),
      queryFn: () => listNotifications(UNREAD_COUNT_PARAMS),
      refetchInterval: UNREAD_POLL_INTERVAL_IN_MS,
      select: (page) => page.meta.total,
    }),
};
