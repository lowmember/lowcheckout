import type { CheckoutEvent } from "@/domain/analytics/entities/checkout-event.entity";
import type { CheckoutEventsRepository } from "@/domain/analytics/repositories/checkout-events.repository";
import type { Database } from "@/infra/persistence/drizzle/database";
import { toCheckoutEventRow } from "@/infra/persistence/drizzle/mappers/checkout-event.mapper";
import { checkoutEvents } from "@/infra/persistence/drizzle/schema";

export class DrizzleCheckoutEventsRepository implements CheckoutEventsRepository {
  private readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async create(event: CheckoutEvent): Promise<void> {
    await this.db.insert(checkoutEvents).values(toCheckoutEventRow(event));
  }
}
