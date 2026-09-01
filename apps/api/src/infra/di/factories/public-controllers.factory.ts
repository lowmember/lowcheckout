import { DefaultProcessPaymentWebhookUseCase } from "@/application/payments/use-cases/process-payment-webhook.usecase";
import { DefaultCreatePublicOrderUseCase } from "@/application/public/use-cases/create-public-order.usecase";
import { DefaultGetPublicCheckoutUseCase } from "@/application/public/use-cases/get-public-checkout.usecase";
import { DefaultGetPublicOrderUseCase } from "@/application/public/use-cases/get-public-order.usecase";
import { DefaultGetPublicOrderStatusUseCase } from "@/application/public/use-cases/get-public-order-status.usecase";
import { env } from "@/infra/config/env";
import { getContainer } from "@/infra/di/container";
import { withErrorHandling } from "@/infra/di/factories/with-error-handling";
import {
  createPublicOrderSchema,
  getPublicCheckoutSchema,
  getPublicOrderSchema,
  processPaymentWebhookSchema,
} from "@/infra/validation/zod/schemas/public.schemas";
import { ZodValidator } from "@/infra/validation/zod/zod-validator.adapter";
import { CreatePublicOrderController } from "@/presentation/http/controllers/public/create-public-order.controller";
import { GetPublicCheckoutController } from "@/presentation/http/controllers/public/get-public-checkout.controller";
import { GetPublicOrderController } from "@/presentation/http/controllers/public/get-public-order.controller";
import { GetPublicOrderStatusController } from "@/presentation/http/controllers/public/get-public-order-status.controller";
import { ProcessPaymentWebhookController } from "@/presentation/http/controllers/webhooks/process-payment-webhook.controller";

/**
 * Nenhum controller daqui passa por `withPanelAccess`/`withOnboardedAccount`:
 * são as rotas do comprador e do gateway, que não têm conta na sessão. O
 * estado da conta é conferido dentro dos próprios casos de uso, pela conta
 * dona do checkout resolvido.
 */
export function makeGetPublicCheckoutController() {
  const {
    publicCheckoutRepository,
    gatewayConnectionsRepository,
    checkoutEventsRepository,
    idGenerator,
    clock,
    logger,
  } = getContainer();

  return withErrorHandling(
    new GetPublicCheckoutController(
      new DefaultGetPublicCheckoutUseCase(
        publicCheckoutRepository,
        gatewayConnectionsRepository,
        checkoutEventsRepository,
        idGenerator,
        clock,
        logger,
      ),
      new ZodValidator(getPublicCheckoutSchema),
    ),
  );
}

export function makeCreatePublicOrderController() {
  const {
    publicCheckoutRepository,
    gatewayConnectionsRepository,
    buyersRepository,
    ordersRepository,
    orderEventsRepository,
    paymentsRepository,
    checkoutEventsRepository,
    salesNotifier,
    paymentGateway,
    encrypter,
    idGenerator,
    clock,
    logger,
  } = getContainer();

  return withErrorHandling(
    new CreatePublicOrderController(
      new DefaultCreatePublicOrderUseCase(
        publicCheckoutRepository,
        gatewayConnectionsRepository,
        buyersRepository,
        ordersRepository,
        orderEventsRepository,
        paymentsRepository,
        checkoutEventsRepository,
        salesNotifier,
        paymentGateway,
        encrypter,
        idGenerator,
        clock,
        logger,
        env.pixExpirationSeconds,
      ),
      new ZodValidator(createPublicOrderSchema),
    ),
  );
}

export function makeGetPublicOrderController() {
  const { ordersRepository, paymentsRepository, orderExpirer, clock } = getContainer();

  return withErrorHandling(
    new GetPublicOrderController(
      new DefaultGetPublicOrderUseCase(ordersRepository, paymentsRepository, orderExpirer, clock),
      new ZodValidator(getPublicOrderSchema),
    ),
  );
}

export function makeGetPublicOrderStatusController() {
  const { ordersRepository, orderExpirer, clock } = getContainer();

  return withErrorHandling(
    new GetPublicOrderStatusController(
      new DefaultGetPublicOrderStatusUseCase(ordersRepository, orderExpirer, clock),
      new ZodValidator(getPublicOrderSchema),
    ),
  );
}

export function makeProcessPaymentWebhookController() {
  const {
    paymentWebhookEventsRepository,
    paymentsRepository,
    ordersRepository,
    orderPaymentConfirmer,
    webhookPayloadReaders,
    idGenerator,
    clock,
    logger,
  } = getContainer();

  return withErrorHandling(
    new ProcessPaymentWebhookController(
      new DefaultProcessPaymentWebhookUseCase(
        paymentWebhookEventsRepository,
        paymentsRepository,
        ordersRepository,
        orderPaymentConfirmer,
        webhookPayloadReaders,
        idGenerator,
        clock,
        logger,
      ),
      new ZodValidator(processPaymentWebhookSchema),
      {
        expectedToken: env.webhookSecret ?? null,
        // Em produção a exigência é incondicional: sem segredo configurado,
        // nenhum webhook passa. Fora dela, só exigimos se houver segredo.
        required: env.stage === "prod" || env.webhookSecret !== undefined,
      },
      logger,
    ),
  );
}
