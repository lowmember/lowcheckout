import type {
  ProcessPaymentWebhookInput,
  ProcessPaymentWebhookUseCase,
} from "@/application/payments/use-cases/process-payment-webhook.usecase";
import type { Logger } from "@/application/shared/ports/logger";
import { UnauthorizedError } from "@/presentation/http/errors/unauthorized.error";
import { ok } from "@/presentation/http/helpers/http-responses";
import type { Controller, HttpRequest, HttpResponse } from "@/presentation/http/protocols/http";
import type { Validator } from "@/presentation/http/protocols/validator";

const TOKEN_HEADER = "x-webhook-token";

export interface WebhookAuthOptions {
  /** Segredo compartilhado esperado; `null` quando o ambiente não configurou nenhum. */
  expectedToken: string | null;
  /** Em produção a exigência é incondicional, mesmo sem segredo configurado. */
  required: boolean;
}

/**
 * Rota **pública** para o gateway (RF-GTW-02): não há sessão de usuário. O que
 * autentica é um segredo compartilhado — no header `x-webhook-token` ou na query
 * `token`, porque nem todo provedor deixa customizar headers.
 *
 * Requisição recusada é registrada e **não** toca em pedido nenhum.
 */
export class ProcessPaymentWebhookController implements Controller {
  private readonly processPaymentWebhookUseCase: ProcessPaymentWebhookUseCase;
  private readonly validator: Validator<ProcessPaymentWebhookInput>;
  private readonly auth: WebhookAuthOptions;
  private readonly logger: Logger;

  constructor(
    processPaymentWebhookUseCase: ProcessPaymentWebhookUseCase,
    validator: Validator<ProcessPaymentWebhookInput>,
    auth: WebhookAuthOptions,
    logger: Logger,
  ) {
    this.processPaymentWebhookUseCase = processPaymentWebhookUseCase;
    this.validator = validator;
    this.auth = auth;
    this.logger = logger;
  }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    this.assertAuthenticated(request);

    const body = request.body !== null && typeof request.body === "object" ? request.body : {};
    const input = this.validator.validate({ ...request.params, payload: body });

    return ok(await this.processPaymentWebhookUseCase.execute(input));
  }

  private assertAuthenticated(request: HttpRequest): void {
    if (!this.auth.required) {
      return;
    }

    const presented = request.headers[TOKEN_HEADER] ?? request.query.token;

    if (
      this.auth.expectedToken === null ||
      presented === undefined ||
      !equalsInConstantTime(presented, this.auth.expectedToken)
    ) {
      this.logger.error("webhook_rejected", { provider: request.params.provider });

      throw new UnauthorizedError();
    }
  }
}

/** Comparação sem short-circuit: o tempo de resposta não conta quantos caracteres bateram. */
function equalsInConstantTime(presented: string, expected: string): boolean {
  if (presented.length !== expected.length) {
    return false;
  }

  let difference = 0;

  for (let index = 0; index < expected.length; index += 1) {
    difference |= presented.charCodeAt(index) ^ expected.charCodeAt(index);
  }

  return difference === 0;
}
