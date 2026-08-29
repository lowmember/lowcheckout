import type { CheckoutCustomizationProps } from "@/domain/checkouts/value-objects/checkout-customization";
import type { CustomizationSource } from "@/domain/checkouts/value-objects/customization-source";

/** Representação primitiva da entidade — é o que atravessa a fronteira do domínio. */
export interface CheckoutCustomizationRevisionSnapshot {
  id: string;
  checkoutId: string;
  customization: CheckoutCustomizationProps;
  source: CustomizationSource;
  /** `null` quando a revisão não teve autor humano (import, backfill, IA). */
  createdByUserId: string | null;
  createdAt: Date;
}

export interface CreateCheckoutCustomizationRevisionProps {
  id: string;
  checkoutId: string;
  customization: CheckoutCustomizationProps;
  source: CustomizationSource;
  createdByUserId?: string | null;
  now: Date;
}

/**
 * Cada escrita de customização vira uma revisão. É isso que dá reversão ao
 * "Importar JSON" (RF-CHK-08), que substitui integralmente o estado anterior.
 * Só nasce e é lida — nunca é editada.
 */
export class CheckoutCustomizationRevision {
  private readonly id: string;
  private readonly checkoutId: string;
  private readonly customization: CheckoutCustomizationProps;
  private readonly source: CustomizationSource;
  private readonly createdByUserId: string | null;
  private readonly createdAt: Date;

  private constructor(props: CheckoutCustomizationRevisionSnapshot) {
    this.id = props.id;
    this.checkoutId = props.checkoutId;
    this.customization = props.customization;
    this.source = props.source;
    this.createdByUserId = props.createdByUserId;
    this.createdAt = props.createdAt;
  }

  static create(props: CreateCheckoutCustomizationRevisionProps): CheckoutCustomizationRevision {
    return new CheckoutCustomizationRevision({
      id: props.id,
      checkoutId: props.checkoutId,
      customization: props.customization,
      source: props.source,
      createdByUserId: props.createdByUserId ?? null,
      createdAt: props.now,
    });
  }

  static restore(snapshot: CheckoutCustomizationRevisionSnapshot): CheckoutCustomizationRevision {
    return new CheckoutCustomizationRevision(snapshot);
  }

  toSnapshot(): CheckoutCustomizationRevisionSnapshot {
    return {
      id: this.id,
      checkoutId: this.checkoutId,
      customization: this.customization,
      source: this.source,
      createdByUserId: this.createdByUserId,
      createdAt: this.createdAt,
    };
  }
}
