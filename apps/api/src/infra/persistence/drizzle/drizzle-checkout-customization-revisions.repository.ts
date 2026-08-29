import type { CheckoutCustomizationRevision } from "@/domain/checkouts/entities/checkout-customization-revision.entity";
import type { CheckoutCustomizationRevisionsRepository } from "@/domain/checkouts/repositories/checkout-customization-revisions.repository";
import type { Database } from "@/infra/persistence/drizzle/database";
import { toCheckoutCustomizationRevisionRow } from "@/infra/persistence/drizzle/mappers/checkout-customization-revision.mapper";
import { checkoutCustomizationRevisions } from "@/infra/persistence/drizzle/schema";

export class DrizzleCheckoutCustomizationRevisionsRepository
  implements CheckoutCustomizationRevisionsRepository
{
  private readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async create(revision: CheckoutCustomizationRevision): Promise<void> {
    await this.db
      .insert(checkoutCustomizationRevisions)
      .values(toCheckoutCustomizationRevisionRow(revision));
  }
}
