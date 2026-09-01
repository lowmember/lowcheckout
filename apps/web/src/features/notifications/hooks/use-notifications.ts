import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/features/notifications/api/notifications.api";
import {
  notificationKeys,
  notificationQueries,
} from "@/features/notifications/api/notifications.queries";

const PANEL_PARAMS = { perPage: 15 } as const;

/** Estado do sino: a página mais recente, o contador de não lidas e as duas escritas. */
export function useNotifications({ isEnabled = true }: { isEnabled?: boolean } = {}) {
  const queryClient = useQueryClient();

  const list = useQuery({ ...notificationQueries.list(PANEL_PARAMS), enabled: isEnabled });
  const unread = useQuery(notificationQueries.unreadCount());

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: notificationKeys.all });
  }

  const markOne = useMutation({ mutationFn: markNotificationAsRead, onSuccess: invalidate });
  const markAll = useMutation({ mutationFn: markAllNotificationsAsRead, onSuccess: invalidate });

  return {
    notifications: list.data?.data ?? [],
    isLoadingNotifications: list.isLoading,
    hasNotificationsError: list.isError,
    unreadCount: unread.data ?? 0,
    markAsRead: markOne.mutateAsync,
    markAllAsRead: markAll.mutateAsync,
    isMarkingAllAsRead: markAll.isPending,
  };
}
