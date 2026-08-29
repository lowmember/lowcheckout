import { User } from "@/domain/users/entities/user.entity";
import type { NewUserRow, UserRow } from "@/infra/persistence/drizzle/schema";

export function toUser(row: UserRow): User {
  return User.restore({
    id: row.id,
    accountId: row.accountId,
    googleSub: row.googleSub,
    email: row.email,
    name: row.name,
    avatarUrl: row.avatarUrl,
    lastLoginAt: row.lastLoginAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

export function toUserRow(user: User): NewUserRow {
  const snapshot = user.toSnapshot();

  return {
    id: snapshot.id,
    accountId: snapshot.accountId,
    googleSub: snapshot.googleSub,
    email: snapshot.email,
    name: snapshot.name,
    avatarUrl: snapshot.avatarUrl,
    lastLoginAt: snapshot.lastLoginAt,
    createdAt: snapshot.createdAt,
    updatedAt: snapshot.updatedAt,
  };
}
