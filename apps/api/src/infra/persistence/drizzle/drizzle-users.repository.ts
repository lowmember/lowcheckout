import { eq } from "drizzle-orm";

import type { User } from "@/domain/users/entities/user.entity";
import type { UsersRepository } from "@/domain/users/repositories/users.repository";
import type { Database } from "@/infra/persistence/drizzle/database";
import { toUser, toUserRow } from "@/infra/persistence/drizzle/mappers/user.mapper";
import { users } from "@/infra/persistence/drizzle/schema";

export class DrizzleUsersRepository implements UsersRepository {
  private readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async findById(userId: string): Promise<User | null> {
    const [row] = await this.db.select().from(users).where(eq(users.id, userId)).limit(1);

    return row ? toUser(row) : null;
  }

  async findByGoogleSub(googleSub: string): Promise<User | null> {
    const [row] = await this.db.select().from(users).where(eq(users.googleSub, googleSub)).limit(1);

    return row ? toUser(row) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const [row] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email.trim().toLowerCase()))
      .limit(1);

    return row ? toUser(row) : null;
  }

  async create(user: User): Promise<void> {
    await this.db.insert(users).values(toUserRow(user));
  }

  async update(user: User): Promise<void> {
    const row = toUserRow(user);

    await this.db.update(users).set(row).where(eq(users.id, row.id));
  }
}
