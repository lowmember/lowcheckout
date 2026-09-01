import { and, count, desc, eq, isNull, type SQL } from "drizzle-orm";

import type { Notification } from "@/domain/notifications/entities/notification.entity";
import type {
  NotificationQuery,
  NotificationsRepository,
} from "@/domain/notifications/repositories/notifications.repository";
import type { Page } from "@/domain/shared/repositories/page";
import type { Database } from "@/infra/persistence/drizzle/database";
import {
  toNotification,
  toNotificationRow,
} from "@/infra/persistence/drizzle/mappers/notification.mapper";
import { notifications } from "@/infra/persistence/drizzle/schema";

export class DrizzleNotificationsRepository implements NotificationsRepository {
  private readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async findMany(query: NotificationQuery): Promise<Page<Notification>> {
    const where = this.buildFilters(query);

    const [rows, [totals]] = await Promise.all([
      this.db
        .select()
        .from(notifications)
        .where(where)
        .orderBy(desc(notifications.createdAt))
        .limit(query.perPage)
        .offset((query.page - 1) * query.perPage),
      this.db.select({ value: count() }).from(notifications).where(where),
    ]);

    return { items: rows.map(toNotification), total: totals?.value ?? 0 };
  }

  async findById(accountId: string, notificationId: string): Promise<Notification | null> {
    const [row] = await this.db
      .select()
      .from(notifications)
      .where(and(eq(notifications.accountId, accountId), eq(notifications.id, notificationId)))
      .limit(1);

    return row ? toNotification(row) : null;
  }

  async countUnread(accountId: string): Promise<number> {
    const [totals] = await this.db
      .select({ value: count() })
      .from(notifications)
      .where(and(eq(notifications.accountId, accountId), isNull(notifications.readAt)));

    return totals?.value ?? 0;
  }

  async create(notification: Notification): Promise<void> {
    await this.db.insert(notifications).values(toNotificationRow(notification));
  }

  async update(notification: Notification): Promise<void> {
    const row = toNotificationRow(notification);

    await this.db
      .update(notifications)
      .set(row)
      .where(and(eq(notifications.accountId, row.accountId), eq(notifications.id, row.id)));
  }

  async markAllAsRead(accountId: string, now: Date): Promise<number> {
    const updated = await this.db
      .update(notifications)
      .set({ readAt: now })
      .where(and(eq(notifications.accountId, accountId), isNull(notifications.readAt)))
      .returning({ id: notifications.id });

    return updated.length;
  }

  private buildFilters(query: NotificationQuery): SQL | undefined {
    const filters: SQL[] = [eq(notifications.accountId, query.accountId)];

    if (query.unreadOnly) {
      filters.push(isNull(notifications.readAt));
    }

    return and(...filters);
  }
}
