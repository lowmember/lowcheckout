import { PublicSlug } from "@/domain/checkouts/value-objects/public-slug";
import { InvariantViolationError } from "@/domain/shared/errors/domain.error";

/** Representação primitiva da entidade — é o que atravessa a fronteira do domínio. */
export interface CheckoutOfferSnapshot {
  id: string;
  accountId: string;
  checkoutId: string;
  offerId: string;
  productId: string;
  publicSlug: string;
  position: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCheckoutOfferProps {
  id: string;
  accountId: string;
  checkoutId: string;
  offerId: string;
  productId: string;
  publicSlug: string;
  position: number;
  now: Date;
}

/**
 * O vínculo manual entre um checkout e uma oferta — e a URL pública que nasce
 * dele. Cada vínculo produz exatamente uma URL (RF-CHK-05). O `productId`
 * redundante é o que sustenta as FKs compostas da invariante (a).
 */
export class CheckoutOffer {
  private readonly id: string;
  private readonly accountId: string;
  private readonly checkoutId: string;
  private readonly offerId: string;
  private readonly productId: string;
  private readonly publicSlug: PublicSlug;
  private position: number;
  private isActive: boolean;
  private readonly createdAt: Date;
  private updatedAt: Date;

  private constructor(props: {
    id: string;
    accountId: string;
    checkoutId: string;
    offerId: string;
    productId: string;
    publicSlug: PublicSlug;
    position: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = props.id;
    this.accountId = props.accountId;
    this.checkoutId = props.checkoutId;
    this.offerId = props.offerId;
    this.productId = props.productId;
    this.publicSlug = props.publicSlug;
    this.position = props.position;
    this.isActive = props.isActive;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(props: CreateCheckoutOfferProps): CheckoutOffer {
    return new CheckoutOffer({
      id: props.id,
      accountId: props.accountId,
      checkoutId: props.checkoutId,
      offerId: props.offerId,
      productId: props.productId,
      publicSlug: PublicSlug.create(props.publicSlug),
      position: CheckoutOffer.toPosition(props.position),
      isActive: true,
      createdAt: props.now,
      updatedAt: props.now,
    });
  }

  /** Reidrata a entidade a partir de um estado já persistido, sem reaplicar regras de criação. */
  static restore(snapshot: CheckoutOfferSnapshot): CheckoutOffer {
    return new CheckoutOffer({
      id: snapshot.id,
      accountId: snapshot.accountId,
      checkoutId: snapshot.checkoutId,
      offerId: snapshot.offerId,
      productId: snapshot.productId,
      publicSlug: PublicSlug.create(snapshot.publicSlug),
      position: snapshot.position,
      isActive: snapshot.isActive,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
    });
  }

  get checkoutOfferId(): string {
    return this.id;
  }

  get currentPublicSlug(): string {
    return this.publicSlug.toString();
  }

  changePosition(position: number, now: Date): void {
    const next = CheckoutOffer.toPosition(position);

    if (this.position === next) {
      return;
    }

    this.position = next;
    this.touch(now);
  }

  /** Desliga a URL pública sem desfazer o vínculo. */
  activate(now: Date): void {
    this.changeActivation(true, now);
  }

  deactivate(now: Date): void {
    this.changeActivation(false, now);
  }

  toSnapshot(): CheckoutOfferSnapshot {
    return {
      id: this.id,
      accountId: this.accountId,
      checkoutId: this.checkoutId,
      offerId: this.offerId,
      productId: this.productId,
      publicSlug: this.publicSlug.toString(),
      position: this.position,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  private changeActivation(isActive: boolean, now: Date): void {
    if (this.isActive === isActive) {
      return;
    }

    this.isActive = isActive;
    this.touch(now);
  }

  private static toPosition(position: number): number {
    if (!Number.isSafeInteger(position) || position < 0) {
      throw new InvariantViolationError(
        "A posição da oferta no checkout deve ser um inteiro não negativo",
      );
    }

    return position;
  }

  private touch(now: Date): void {
    this.updatedAt = now;
  }
}
