import type {
  ListNotificationsParams,
  Notification,
} from "@/features/notifications/types/notification";
import { httpClient } from "@/shared/api/http-client";
import type { ApiResponse, PaginatedResponse } from "@/shared/api/types";

export async function listNotifications(params: ListNotificationsParams = {}) {
  const response = await httpClient.get<PaginatedResponse<Notification>>("/notifications", {
    params,
  });
  return response.data;
}

export async function markNotificationAsRead(notificationId: string) {
  const response = await httpClient.post<ApiResponse<Notification>>(
    `/notifications/${notificationId}/read`,
  );
  return response.data.data;
}

export async function markAllNotificationsAsRead() {
  const response =
    await httpClient.post<ApiResponse<{ markedAsRead: number }>>("/notifications/read");
  return response.data.data;
}
