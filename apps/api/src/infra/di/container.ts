import type { AccessTokenIssuer } from "@/application/auth/ports/access-token-issuer";
import type { GoogleIdentityVerifier } from "@/application/auth/ports/google-identity-verifier";
import {
  DefaultSessionIssuer,
  type SessionIssuer,
} from "@/application/auth/services/session-issuer";
import {
  DefaultSalesNotifier,
  type SalesNotifier,
} from "@/application/notifications/services/sales-notifier";
import {
  DefaultOrderExpirer,
  type OrderExpirer,
} from "@/application/orders/services/order-expirer";
import {
  DefaultOrderPaymentConfirmer,
  type OrderPaymentConfirmer,
} from "@/application/orders/services/order-payment-confirmer";
import type { PaymentGateway } from "@/application/payments/ports/payment-gateway";
import type { WebhookPayloadReader } from "@/application/payments/ports/webhook-payload-reader";
import type { Clock } from "@/application/shared/ports/clock";
import type { Encrypter } from "@/application/shared/ports/encrypter";
import type { Hasher } from "@/application/shared/ports/hasher";
import type { IdGenerator } from "@/application/shared/ports/id-generator";
import type { Logger } from "@/application/shared/ports/logger";
import type { Mailer } from "@/application/shared/ports/mailer";
import type { SecretGenerator } from "@/application/shared/ports/secret-generator";
import type { VerificationCodeGenerator } from "@/application/shared/ports/verification-code-generator";
import type { FileStorage } from "@/application/uploads/ports/file-storage";
import type { AccountsRepository } from "@/domain/accounts/repositories/accounts.repository";
import type { CheckoutEventsRepository } from "@/domain/analytics/repositories/checkout-events.repository";
import type { OrderAnalyticsRepository } from "@/domain/analytics/repositories/order-analytics.repository";
import type { BuyersRepository } from "@/domain/buyers/repositories/buyers.repository";
import type { CheckoutCustomizationRevisionsRepository } from "@/domain/checkouts/repositories/checkout-customization-revisions.repository";
import type { CheckoutOffersRepository } from "@/domain/checkouts/repositories/checkout-offers.repository";
import type { CheckoutPixelsRepository } from "@/domain/checkouts/repositories/checkout-pixels.repository";
import type { CheckoutsRepository } from "@/domain/checkouts/repositories/checkouts.repository";
import type { PublicCheckoutRepository } from "@/domain/checkouts/repositories/public-checkout.repository";
import type { GatewayConnectionsRepository } from "@/domain/gateways/repositories/gateway-connections.repository";
import type { NotificationsRepository } from "@/domain/notifications/repositories/notifications.repository";
import type { OffersRepository } from "@/domain/offers/repositories/offers.repository";
import type { OrderEventsRepository } from "@/domain/orders/repositories/order-events.repository";
import type { OrdersRepository } from "@/domain/orders/repositories/orders.repository";
import type { PaymentWebhookEventsRepository } from "@/domain/payments/repositories/payment-webhook-events.repository";
import type { PaymentsRepository } from "@/domain/payments/repositories/payments.repository";
import type { ProductsRepository } from "@/domain/products/repositories/products.repository";
import type { RefreshTokensRepository } from "@/domain/sessions/repositories/refresh-tokens.repository";
import type { UsersRepository } from "@/domain/users/repositories/users.repository";
import { JoseGoogleIdentityVerifier } from "@/infra/auth/google-identity.verifier";
import { JwtAccessTokenIssuer } from "@/infra/auth/jwt-access-token.issuer";
import { UnavailableGoogleIdentityVerifier } from "@/infra/auth/unavailable-google-identity.verifier";
import { env } from "@/infra/config/env";
import { ConsoleLogger } from "@/infra/logging/console-logger.adapter";
import { LoggerMailer } from "@/infra/mail/logger-mailer.adapter";
import { EfiBankPaymentGateway } from "@/infra/payments/efibank-payment.gateway";
import {
  EfiBankWebhookPayloadReader,
  FakeWebhookPayloadReader,
} from "@/infra/payments/efibank-webhook-payload.reader";
import { FakePaymentGateway } from "@/infra/payments/fake-payment.gateway";
import { createDatabase, type Database } from "@/infra/persistence/drizzle/database";
import { DrizzleAccountsRepository } from "@/infra/persistence/drizzle/drizzle-accounts.repository";
import { DrizzleBuyersRepository } from "@/infra/persistence/drizzle/drizzle-buyers.repository";
import { DrizzleCheckoutCustomizationRevisionsRepository } from "@/infra/persistence/drizzle/drizzle-checkout-customization-revisions.repository";
import { DrizzleCheckoutEventsRepository } from "@/infra/persistence/drizzle/drizzle-checkout-events.repository";
import { DrizzleCheckoutOffersRepository } from "@/infra/persistence/drizzle/drizzle-checkout-offers.repository";
import { DrizzleCheckoutPixelsRepository } from "@/infra/persistence/drizzle/drizzle-checkout-pixels.repository";
import { DrizzleCheckoutsRepository } from "@/infra/persistence/drizzle/drizzle-checkouts.repository";
import { DrizzleGatewayConnectionsRepository } from "@/infra/persistence/drizzle/drizzle-gateway-connections.repository";
import { DrizzleNotificationsRepository } from "@/infra/persistence/drizzle/drizzle-notifications.repository";
import { DrizzleOffersRepository } from "@/infra/persistence/drizzle/drizzle-offers.repository";
import { DrizzleOrderAnalyticsRepository } from "@/infra/persistence/drizzle/drizzle-order-analytics.repository";
import {
  DrizzleOrderEventsRepository,
  DrizzleOrdersRepository,
} from "@/infra/persistence/drizzle/drizzle-orders.repository";
import {
  DrizzlePaymentsRepository,
  DrizzlePaymentWebhookEventsRepository,
} from "@/infra/persistence/drizzle/drizzle-payments.repository";
import { DrizzleProductsRepository } from "@/infra/persistence/drizzle/drizzle-products.repository";
import { DrizzlePublicCheckoutRepository } from "@/infra/persistence/drizzle/drizzle-public-checkout.repository";
import { DrizzleRefreshTokensRepository } from "@/infra/persistence/drizzle/drizzle-refresh-tokens.repository";
import { DrizzleUsersRepository } from "@/infra/persistence/drizzle/drizzle-users.repository";
import { AesGcmEncrypter } from "@/infra/providers/aes-gcm-encrypter.adapter";
import { CryptoIdGenerator } from "@/infra/providers/crypto-id-generator.adapter";
import { CryptoSecretGenerator } from "@/infra/providers/crypto-secret-generator.adapter";
import { CryptoVerificationCodeGenerator } from "@/infra/providers/crypto-verification-code-generator.adapter";
import { Sha256Hasher } from "@/infra/providers/sha256-hasher.adapter";
import { SystemClock } from "@/infra/providers/system-clock.adapter";
import { S3FileStorage } from "@/infra/storage/s3-file-storage.adapter";
import { UnavailableFileStorage } from "@/infra/storage/unavailable-file-storage.adapter";

export interface Container {
  logger: Logger;
  clock: Clock;
  idGenerator: IdGenerator;
  hasher: Hasher;
  secretGenerator: SecretGenerator;
  verificationCodeGenerator: VerificationCodeGenerator;
  encrypter: Encrypter;
  database: Database;
  accessTokenIssuer: AccessTokenIssuer;
  sessionIssuer: SessionIssuer;
  paymentGateway: PaymentGateway;
  webhookPayloadReaders: readonly WebhookPayloadReader[];
  mailer: Mailer;
  salesNotifier: SalesNotifier;
  orderExpirer: OrderExpirer;
  orderPaymentConfirmer: OrderPaymentConfirmer;
  accountsRepository: AccountsRepository;
  usersRepository: UsersRepository;
  refreshTokensRepository: RefreshTokensRepository;
  productsRepository: ProductsRepository;
  offersRepository: OffersRepository;
  checkoutsRepository: CheckoutsRepository;
  checkoutOffersRepository: CheckoutOffersRepository;
  checkoutCustomizationRevisionsRepository: CheckoutCustomizationRevisionsRepository;
  checkoutPixelsRepository: CheckoutPixelsRepository;
  gatewayConnectionsRepository: GatewayConnectionsRepository;
  publicCheckoutRepository: PublicCheckoutRepository;
  buyersRepository: BuyersRepository;
  notificationsRepository: NotificationsRepository;
  ordersRepository: OrdersRepository;
  orderEventsRepository: OrderEventsRepository;
  paymentsRepository: PaymentsRepository;
  paymentWebhookEventsRepository: PaymentWebhookEventsRepository;
  checkoutEventsRepository: CheckoutEventsRepository;
  orderAnalyticsRepository: OrderAnalyticsRepository;
}

let container: Container | undefined;

/**
 * Composition root: o único lugar que conhece implementações concretas e as
 * amarra às portas. Fica em cache entre invocações quentes do Lambda para
 * reaproveitar a conexão com o banco.
 */
export function getContainer(): Container {
  if (container) {
    return container;
  }

  const { db } = createDatabase({
    connectionString: env.databaseUrl,
    poolMax: env.databasePoolMax,
  });

  const clock = new SystemClock();
  const idGenerator = new CryptoIdGenerator();
  const hasher = new Sha256Hasher();
  const secretGenerator = new CryptoSecretGenerator();
  const refreshTokensRepository = new DrizzleRefreshTokensRepository(db);

  const logger = new ConsoleLogger(env.logLevel);
  const mailer = new LoggerMailer(logger);
  const notificationsRepository = new DrizzleNotificationsRepository(db);
  const ordersRepository = new DrizzleOrdersRepository(db);
  const orderEventsRepository = new DrizzleOrderEventsRepository(db);
  const paymentsRepository = new DrizzlePaymentsRepository(db);
  const checkoutEventsRepository = new DrizzleCheckoutEventsRepository(db);

  const salesNotifier = new DefaultSalesNotifier(
    notificationsRepository,
    idGenerator,
    clock,
    logger,
  );

  const accessTokenIssuer = new JwtAccessTokenIssuer({
    secret: env.jwtSecret,
    issuer: env.jwtIssuer,
    audience: env.jwtAudience,
    ttlSeconds: env.accessTokenTtlSeconds,
  });

  container = {
    logger,
    clock,
    idGenerator,
    hasher,
    secretGenerator,
    verificationCodeGenerator: new CryptoVerificationCodeGenerator(),
    encrypter: new AesGcmEncrypter(env.encryptionKey),
    database: db,
    accessTokenIssuer,
    sessionIssuer: new DefaultSessionIssuer(
      accessTokenIssuer,
      refreshTokensRepository,
      secretGenerator,
      hasher,
      idGenerator,
      clock,
      env.refreshTokenTtlDays,
    ),
    accountsRepository: new DrizzleAccountsRepository(db),
    usersRepository: new DrizzleUsersRepository(db),
    refreshTokensRepository,
    productsRepository: new DrizzleProductsRepository(db),
    offersRepository: new DrizzleOffersRepository(db),
    checkoutsRepository: new DrizzleCheckoutsRepository(db),
    checkoutOffersRepository: new DrizzleCheckoutOffersRepository(db),
    checkoutCustomizationRevisionsRepository: new DrizzleCheckoutCustomizationRevisionsRepository(
      db,
    ),
    checkoutPixelsRepository: new DrizzleCheckoutPixelsRepository(db),
    gatewayConnectionsRepository: new DrizzleGatewayConnectionsRepository(db),
    publicCheckoutRepository: new DrizzlePublicCheckoutRepository(db),
    buyersRepository: new DrizzleBuyersRepository(db),
    notificationsRepository,
    ordersRepository,
    orderEventsRepository,
    paymentsRepository,
    paymentWebhookEventsRepository: new DrizzlePaymentWebhookEventsRepository(db),
    checkoutEventsRepository,
    orderAnalyticsRepository: new DrizzleOrderAnalyticsRepository(db),
    paymentGateway: makePaymentGateway(clock),
    webhookPayloadReaders: makeWebhookPayloadReaders(),
    mailer,
    salesNotifier,
    orderExpirer: new DefaultOrderExpirer(
      ordersRepository,
      orderEventsRepository,
      paymentsRepository,
      checkoutEventsRepository,
      salesNotifier,
      idGenerator,
      logger,
    ),
    orderPaymentConfirmer: new DefaultOrderPaymentConfirmer(
      ordersRepository,
      orderEventsRepository,
      checkoutEventsRepository,
      mailer,
      salesNotifier,
      idGenerator,
      clock,
      logger,
    ),
  };

  return container;
}

/**
 * O leitor do dublê só existe quando o dublê está no ar: em produção o webhook
 * aceita exclusivamente o formato do provedor real.
 */
function makeWebhookPayloadReaders(): readonly WebhookPayloadReader[] {
  return usesRealGateway()
    ? [new EfiBankWebhookPayloadReader()]
    : [new FakeWebhookPayloadReader(), new EfiBankWebhookPayloadReader()];
}

/**
 * `auto` é a regra de todo dia: EfiBank real só em produção, dublê no resto.
 * `PAYMENT_GATEWAY=efibank` força o real (para exercitar o sandbox do provedor)
 * e `fake` força o dublê.
 */
function makePaymentGateway(clock: Clock): PaymentGateway {
  return usesRealGateway() ? new EfiBankPaymentGateway(clock) : new FakePaymentGateway(clock);
}

function usesRealGateway(): boolean {
  return (
    env.paymentGateway === "efibank" || (env.paymentGateway === "auto" && env.stage === "prod")
  );
}

/**
 * O verificador do Google fica fora do container porque depende de uma variável
 * opcional. Sem `GOOGLE_CLIENT_ID` devolvemos o substituto que responde 503 na
 * chamada — lançar aqui derrubaria o Lambda antes de o controller existir.
 */
export function getGoogleIdentityVerifier(): GoogleIdentityVerifier {
  if (!env.googleClientId) {
    return new UnavailableGoogleIdentityVerifier();
  }

  return new JoseGoogleIdentityVerifier(env.googleClientId);
}

/**
 * Mesmo arranjo do verificador do Google, e pela mesma razão: o bucket é
 * opcional. Sem `S3_UPLOADS_BUCKET` o envio responde 503 e o painel continua
 * aceitando URL colada, em vez de o ambiente inteiro deixar de subir.
 */
export function getFileStorage(): FileStorage {
  if (!env.s3UploadsBucket) {
    return new UnavailableFileStorage();
  }

  return new S3FileStorage({
    bucket: env.s3UploadsBucket,
    region: env.awsRegion,
    publicBaseUrl: env.s3UploadsPublicBaseUrl,
  });
}
