import { PixelExternalId } from "@/domain/checkouts/value-objects/pixel-external-id";
import type { PixelProvider } from "@/domain/checkouts/value-objects/pixel-provider";

/** Representação primitiva da entidade — é o que atravessa a fronteira do domínio. */
export interface CheckoutPixelSnapshot {
  id: string;
  accountId: string;
  checkoutId: string;
  provider: PixelProvider;
  externalId: string;
  /** Credencial de terceiro: chega e sai **cifrada** pelo `Encrypter`. */
  accessToken: string | null;
  config: Record<string, unknown>;
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCheckoutPixelProps {
  id: string;
  accountId: string;
  checkoutId: string;
  provider: PixelProvider;
  externalId: string;
  accessToken?: string | null;
  config?: Record<string, unknown> | null;
  isEnabled?: boolean;
  now: Date;
}

/**
 * Tracking é por checkout, não por conta (RF-CHK-10): cada checkout costuma ser
 * uma campanha. Um registro por provider, garantido pelo
 * `unique(checkout_id, provider)`.
 */
export class CheckoutPixel {
  private readonly id: string;
  private readonly accountId: string;
  private readonly checkoutId: string;
  private readonly provider: PixelProvider;
  private externalId: PixelExternalId;
  private accessToken: string | null;
  private config: Record<string, unknown>;
  private isEnabled: boolean;
  private readonly createdAt: Date;
  private updatedAt: Date;

  private constructor(props: {
    id: string;
    accountId: string;
    checkoutId: string;
    provider: PixelProvider;
    externalId: PixelExternalId;
    accessToken: string | null;
    config: Record<string, unknown>;
    isEnabled: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = props.id;
    this.accountId = props.accountId;
    this.checkoutId = props.checkoutId;
    this.provider = props.provider;
    this.externalId = props.externalId;
    this.accessToken = props.accessToken;
    this.config = props.config;
    this.isEnabled = props.isEnabled;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(props: CreateCheckoutPixelProps): CheckoutPixel {
    return new CheckoutPixel({
      id: props.id,
      accountId: props.accountId,
      checkoutId: props.checkoutId,
      provider: props.provider,
      externalId: PixelExternalId.create(props.externalId, props.provider),
      accessToken: props.accessToken ?? null,
      config: props.config ?? {},
      isEnabled: props.isEnabled ?? true,
      createdAt: props.now,
      updatedAt: props.now,
    });
  }

  /** Reidrata a entidade a partir de um estado já persistido, sem reaplicar regras de criação. */
  static restore(snapshot: CheckoutPixelSnapshot): CheckoutPixel {
    return new CheckoutPixel({
      id: snapshot.id,
      accountId: snapshot.accountId,
      checkoutId: snapshot.checkoutId,
      provider: snapshot.provider,
      externalId: PixelExternalId.create(snapshot.externalId, snapshot.provider),
      accessToken: snapshot.accessToken,
      config: snapshot.config,
      isEnabled: snapshot.isEnabled,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
    });
  }

  get checkoutPixelId(): string {
    return this.id;
  }

  get pixelProvider(): PixelProvider {
    return this.provider;
  }

  get encryptedAccessToken(): string | null {
    return this.accessToken;
  }

  get enabled(): boolean {
    return this.isEnabled;
  }

  get currentExternalId(): string {
    return this.externalId.toString();
  }

  update(
    props: {
      externalId: string;
      accessToken?: string | null;
      config?: Record<string, unknown> | null;
      isEnabled?: boolean;
    },
    now: Date,
  ): void {
    this.externalId = PixelExternalId.create(props.externalId, this.provider);
    this.accessToken = props.accessToken ?? null;
    this.config = props.config ?? {};
    this.isEnabled = props.isEnabled ?? true;
    this.updatedAt = now;
  }

  toSnapshot(): CheckoutPixelSnapshot {
    return {
      id: this.id,
      accountId: this.accountId,
      checkoutId: this.checkoutId,
      provider: this.provider,
      externalId: this.externalId.toString(),
      accessToken: this.accessToken,
      config: this.config,
      isEnabled: this.isEnabled,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
