import { OfferName } from "@/domain/offers/value-objects/offer-name";
import { type OfferStatus, toOfferStatus } from "@/domain/offers/value-objects/offer-status";
import { InvariantViolationError } from "@/domain/shared/errors/domain.error";
import { Money } from "@/domain/shared/value-objects/money";
import { Url } from "@/domain/shared/value-objects/url";

/** Representação primitiva da entidade — é o que atravessa a fronteira do domínio. */
export interface OfferSnapshot {
  id: string;
  accountId: string;
  productId: string;
  name: string;
  priceInCents: number;
  currency: string;
  imageUrl: string | null;
  deliveryUrl: string | null;
  status: OfferStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOfferProps {
  id: string;
  accountId: string;
  productId: string;
  name: string;
  priceInCents: number;
  currency: string;
  imageUrl?: string | null;
  deliveryUrl?: string | null;
  now: Date;
}

export class Offer {
  private readonly id: string;
  private readonly accountId: string;
  private readonly productId: string;
  private name: OfferName;
  private price: Money;
  private imageUrl: Url | null;
  private deliveryUrl: Url | null;
  private status: OfferStatus;
  private readonly createdAt: Date;
  private updatedAt: Date;

  private constructor(props: {
    id: string;
    accountId: string;
    productId: string;
    name: OfferName;
    price: Money;
    imageUrl: Url | null;
    deliveryUrl: Url | null;
    status: OfferStatus;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = props.id;
    this.accountId = props.accountId;
    this.productId = props.productId;
    this.name = props.name;
    this.price = props.price;
    this.imageUrl = props.imageUrl;
    this.deliveryUrl = props.deliveryUrl;
    this.status = props.status;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(props: CreateOfferProps): Offer {
    return new Offer({
      id: props.id,
      accountId: props.accountId,
      productId: props.productId,
      name: OfferName.create(props.name),
      price: Offer.toPrice(props.priceInCents, props.currency),
      imageUrl: Url.createOptional(props.imageUrl),
      deliveryUrl: Url.createOptional(props.deliveryUrl),
      status: "active",
      createdAt: props.now,
      updatedAt: props.now,
    });
  }

  /** Reidrata a entidade a partir de um estado já persistido, sem reaplicar regras de criação. */
  static restore(snapshot: OfferSnapshot): Offer {
    return new Offer({
      id: snapshot.id,
      accountId: snapshot.accountId,
      productId: snapshot.productId,
      name: OfferName.create(snapshot.name),
      price: Money.create(snapshot.priceInCents, snapshot.currency),
      imageUrl: snapshot.imageUrl === null ? null : Url.create(snapshot.imageUrl),
      deliveryUrl: snapshot.deliveryUrl === null ? null : Url.create(snapshot.deliveryUrl),
      status: toOfferStatus(snapshot.status),
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
    });
  }

  get offerId(): string {
    return this.id;
  }

  get ownerAccountId(): string {
    return this.accountId;
  }

  /** Imutável: uma oferta não pode ser movida para outro produto (RF-OFER-03). */
  get parentProductId(): string {
    return this.productId;
  }

  /** `null` = a página pública cai na imagem do produto. */
  get currentImageUrl(): string | null {
    return this.imageUrl?.toString() ?? null;
  }

  get currentDeliveryUrl(): string | null {
    return this.deliveryUrl?.toString() ?? null;
  }

  get currentStatus(): OfferStatus {
    return this.status;
  }

  rename(name: string, now: Date): void {
    const nextName = OfferName.create(name);

    if (this.name.equals(nextName)) {
      return;
    }

    this.name = nextName;
    this.touch(now);
  }

  /** Muda o preço só para cobranças futuras; pedidos já criados guardam o snapshot (RF-PAG-06). */
  changePrice(priceInCents: number, currency: string, now: Date): void {
    const nextPrice = Offer.toPrice(priceInCents, currency);

    if (this.price.equals(nextPrice)) {
      return;
    }

    this.price = nextPrice;
    this.touch(now);
  }

  changeImageUrl(imageUrl: string | null, now: Date): void {
    const nextImageUrl = Url.createOptional(imageUrl);

    if (this.imageUrl?.toString() === nextImageUrl?.toString()) {
      return;
    }

    this.imageUrl = nextImageUrl;
    this.touch(now);
  }

  changeDeliveryUrl(deliveryUrl: string | null, now: Date): void {
    const nextDeliveryUrl = Url.createOptional(deliveryUrl);

    if (this.deliveryUrl?.toString() === nextDeliveryUrl?.toString()) {
      return;
    }

    this.deliveryUrl = nextDeliveryUrl;
    this.touch(now);
  }

  changeStatus(status: OfferStatus, now: Date): void {
    if (this.status === status) {
      return;
    }

    this.status = status;
    this.touch(now);
  }

  toSnapshot(): OfferSnapshot {
    return {
      id: this.id,
      accountId: this.accountId,
      productId: this.productId,
      name: this.name.toString(),
      priceInCents: this.price.cents,
      currency: this.price.currency,
      imageUrl: this.imageUrl?.toString() ?? null,
      deliveryUrl: this.deliveryUrl?.toString() ?? null,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /** O preço da oferta é estritamente maior que zero (RF-OFER-01). */
  private static toPrice(priceInCents: number, currency: string): Money {
    const price = Money.create(priceInCents, currency);

    if (!price.isPositive()) {
      throw new InvariantViolationError("O valor da oferta deve ser maior que zero");
    }

    return price;
  }

  private touch(now: Date): void {
    this.updatedAt = now;
  }
}
