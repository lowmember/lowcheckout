import type { CheckoutCustomizationRevision } from "@/domain/checkouts/entities/checkout-customization-revision.entity";

/** Histórico append-only da customização de um checkout (RF-CHK-08). */
export interface CheckoutCustomizationRevisionsRepository {
  create(revision: CheckoutCustomizationRevision): Promise<void>;
}
