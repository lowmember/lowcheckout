import { ProductName } from "@/domain/products/value-objects/product-name";
import {
  type ProductStatus,
  toProductStatus,
} from "@/domain/products/value-objects/product-status";
import { InvariantViolationError } from "@/domain/shared/errors/domain.error";
import { Url } from "@/domain/shared/value-objects/url";

/** Representação primitiva da entidade — é o que atravessa a fronteira do domínio. */
export interface ProductSnapshot {
  id: string;
  accountId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  defaultDeliveryUrl: string | null;
  status: ProductStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductProps {
  id: string;
  accountId: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  defaultDeliveryUrl?: string | null;
  now: Date;
}

const MAX_DESCRIPTION_LENGTH = 5000;

export class Product {
  private readonly id: string;
  private readonly accountId: string;
  private name: ProductName;
  private description: string | null;
  private imageUrl: Url | null;
  private defaultDeliveryUrl: Url | null;
  private status: ProductStatus;
  private readonly createdAt: Date;
  private updatedAt: Date;

  private constructor(props: {
    id: string;
    accountId: string;
    name: ProductName;
    description: string | null;
    imageUrl: Url | null;
    defaultDeliveryUrl: Url | null;
    status: ProductStatus;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = props.id;
    this.accountId = props.accountId;
    this.name = props.name;
    this.description = props.description;
    this.imageUrl = props.imageUrl;
    this.defaultDeliveryUrl = props.defaultDeliveryUrl;
    this.status = props.status;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  /** Só o nome é obrigatório (RF-PROD-01); preço não existe aqui — é atributo da oferta. */
  static create(props: CreateProductProps): Product {
    return new Product({
      id: props.id,
      accountId: props.accountId,
      name: ProductName.create(props.name),
      description: Product.normalizeDescription(props.description),
      imageUrl: Url.createOptional(props.imageUrl),
      defaultDeliveryUrl: Url.createOptional(props.defaultDeliveryUrl),
      status: "active",
      createdAt: props.now,
      updatedAt: props.now,
    });
  }

  /** Reidrata a entidade a partir de um estado já persistido, sem reaplicar regras de criação. */
  static restore(snapshot: ProductSnapshot): Product {
    return new Product({
      id: snapshot.id,
      accountId: snapshot.accountId,
      name: ProductName.create(snapshot.name),
      description: snapshot.description,
      imageUrl: snapshot.imageUrl === null ? null : Url.create(snapshot.imageUrl),
      defaultDeliveryUrl:
        snapshot.defaultDeliveryUrl === null ? null : Url.create(snapshot.defaultDeliveryUrl),
      status: toProductStatus(snapshot.status),
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
    });
  }

  get productId(): string {
    return this.id;
  }

  get ownerAccountId(): string {
    return this.accountId;
  }

  /** `null` = herdar nada; é o que as ofertas consultam no fallback (RF-OFER-02). */
  get currentDefaultDeliveryUrl(): string | null {
    return this.defaultDeliveryUrl?.toString() ?? null;
  }

  rename(name: string, now: Date): void {
    const nextName = ProductName.create(name);

    if (this.name.equals(nextName)) {
      return;
    }

    this.name = nextName;
    this.touch(now);
  }

  changeDescription(description: string | null, now: Date): void {
    const nextDescription = Product.normalizeDescription(description);

    if (this.description === nextDescription) {
      return;
    }

    this.description = nextDescription;
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

  changeDefaultDeliveryUrl(defaultDeliveryUrl: string | null, now: Date): void {
    const nextDeliveryUrl = Url.createOptional(defaultDeliveryUrl);

    if (this.defaultDeliveryUrl?.toString() === nextDeliveryUrl?.toString()) {
      return;
    }

    this.defaultDeliveryUrl = nextDeliveryUrl;
    this.touch(now);
  }

  changeStatus(status: ProductStatus, now: Date): void {
    if (this.status === status) {
      return;
    }

    this.status = status;
    this.touch(now);
  }

  toSnapshot(): ProductSnapshot {
    return {
      id: this.id,
      accountId: this.accountId,
      name: this.name.toString(),
      description: this.description,
      imageUrl: this.imageUrl?.toString() ?? null,
      defaultDeliveryUrl: this.defaultDeliveryUrl?.toString() ?? null,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  private static normalizeDescription(description: string | null | undefined): string | null {
    if (description === null || description === undefined) {
      return null;
    }

    const normalized = description.trim();

    if (normalized === "") {
      return null;
    }

    if (normalized.length > MAX_DESCRIPTION_LENGTH) {
      throw new InvariantViolationError(
        `A descrição do produto deve ter no máximo ${MAX_DESCRIPTION_LENGTH} caracteres`,
      );
    }

    return normalized;
  }

  private touch(now: Date): void {
    this.updatedAt = now;
  }
}
