import {
  CheckoutCustomization,
  type CheckoutCustomizationProps,
} from "@/domain/checkouts/value-objects/checkout-customization";
import {
  type CheckoutStatus,
  toCheckoutStatus,
} from "@/domain/checkouts/value-objects/checkout-status";
import { CheckoutTitle } from "@/domain/checkouts/value-objects/checkout-title";
import { Url } from "@/domain/shared/value-objects/url";

/** Representação primitiva da entidade — é o que atravessa a fronteira do domínio. */
export interface CheckoutSnapshot {
  id: string;
  accountId: string;
  productId: string;
  internalTitle: string;
  displayName: string;
  bannerDesktopUrl: string | null;
  bannerMobileUrl: string | null;
  customization: CheckoutCustomizationProps;
  status: CheckoutStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCheckoutProps {
  id: string;
  accountId: string;
  productId: string;
  internalTitle: string;
  displayName: string;
  bannerDesktopUrl?: string | null;
  bannerMobileUrl?: string | null;
  now: Date;
}

export class Checkout {
  private readonly id: string;
  private readonly accountId: string;
  /** Imutável após a criação: trocar de produto invalidaria as ofertas vinculadas (RF-CHK-03). */
  private readonly productId: string;
  private internalTitle: CheckoutTitle;
  private displayName: CheckoutTitle;
  private bannerDesktopUrl: Url | null;
  private bannerMobileUrl: Url | null;
  private customization: CheckoutCustomization;
  private status: CheckoutStatus;
  private readonly createdAt: Date;
  private updatedAt: Date;

  private constructor(props: {
    id: string;
    accountId: string;
    productId: string;
    internalTitle: CheckoutTitle;
    displayName: CheckoutTitle;
    bannerDesktopUrl: Url | null;
    bannerMobileUrl: Url | null;
    customization: CheckoutCustomization;
    status: CheckoutStatus;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = props.id;
    this.accountId = props.accountId;
    this.productId = props.productId;
    this.internalTitle = props.internalTitle;
    this.displayName = props.displayName;
    this.bannerDesktopUrl = props.bannerDesktopUrl;
    this.bannerMobileUrl = props.bannerMobileUrl;
    this.customization = props.customization;
    this.status = props.status;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  /**
   * Um checkout nasce em `draft` e sem nenhuma oferta exposta: o vínculo com
   * ofertas é sempre manual (RF-OFER-05).
   */
  static create(props: CreateCheckoutProps): Checkout {
    return new Checkout({
      id: props.id,
      accountId: props.accountId,
      productId: props.productId,
      internalTitle: CheckoutTitle.create(props.internalTitle),
      displayName: CheckoutTitle.create(props.displayName),
      bannerDesktopUrl: Url.createOptional(props.bannerDesktopUrl),
      bannerMobileUrl: Url.createOptional(props.bannerMobileUrl),
      customization: CheckoutCustomization.default(),
      status: "draft",
      createdAt: props.now,
      updatedAt: props.now,
    });
  }

  /** Reidrata a entidade a partir de um estado já persistido, sem reaplicar regras de criação. */
  static restore(snapshot: CheckoutSnapshot): Checkout {
    return new Checkout({
      id: snapshot.id,
      accountId: snapshot.accountId,
      productId: snapshot.productId,
      internalTitle: CheckoutTitle.create(snapshot.internalTitle),
      displayName: CheckoutTitle.create(snapshot.displayName),
      bannerDesktopUrl:
        snapshot.bannerDesktopUrl === null ? null : Url.create(snapshot.bannerDesktopUrl),
      bannerMobileUrl:
        snapshot.bannerMobileUrl === null ? null : Url.create(snapshot.bannerMobileUrl),
      customization: CheckoutCustomization.restore(snapshot.customization),
      status: toCheckoutStatus(snapshot.status),
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
    });
  }

  get checkoutId(): string {
    return this.id;
  }

  get ownerAccountId(): string {
    return this.accountId;
  }

  get soldProductId(): string {
    return this.productId;
  }

  get currentDisplayName(): string {
    return this.displayName.toString();
  }

  changeInternalTitle(internalTitle: string, now: Date): void {
    const next = CheckoutTitle.create(internalTitle);

    if (this.internalTitle.equals(next)) {
      return;
    }

    this.internalTitle = next;
    this.touch(now);
  }

  changeDisplayName(displayName: string, now: Date): void {
    const next = CheckoutTitle.create(displayName);

    if (this.displayName.equals(next)) {
      return;
    }

    this.displayName = next;
    this.touch(now);
  }

  changeBannerDesktopUrl(bannerDesktopUrl: string | null, now: Date): void {
    const next = Url.createOptional(bannerDesktopUrl);

    if (this.bannerDesktopUrl?.toString() === next?.toString()) {
      return;
    }

    this.bannerDesktopUrl = next;
    this.touch(now);
  }

  changeBannerMobileUrl(bannerMobileUrl: string | null, now: Date): void {
    const next = Url.createOptional(bannerMobileUrl);

    if (this.bannerMobileUrl?.toString() === next?.toString()) {
      return;
    }

    this.bannerMobileUrl = next;
    this.touch(now);
  }

  /**
   * Builder manual e "Importar JSON" escrevem aqui (RF-CHK-07/08): a
   * substituição é total, nunca merge parcial. Quem versiona a mudança é o caso
   * de uso, gravando a revisão com a origem correta.
   */
  replaceCustomization(customization: CheckoutCustomization, now: Date): void {
    this.customization = customization;
    this.touch(now);
  }

  get currentCustomization(): CheckoutCustomizationProps {
    return this.customization.toProps();
  }

  changeStatus(status: CheckoutStatus, now: Date): void {
    if (this.status === status) {
      return;
    }

    this.status = status;
    this.touch(now);
  }

  toSnapshot(): CheckoutSnapshot {
    return {
      id: this.id,
      accountId: this.accountId,
      productId: this.productId,
      internalTitle: this.internalTitle.toString(),
      displayName: this.displayName.toString(),
      bannerDesktopUrl: this.bannerDesktopUrl?.toString() ?? null,
      bannerMobileUrl: this.bannerMobileUrl?.toString() ?? null,
      customization: this.customization.toProps(),
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  private touch(now: Date): void {
    this.updatedAt = now;
  }
}
