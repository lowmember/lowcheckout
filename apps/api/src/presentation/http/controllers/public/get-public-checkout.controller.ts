import type {
  GetPublicCheckoutInput,
  GetPublicCheckoutUseCase,
} from "@/application/public/use-cases/get-public-checkout.usecase";
import { ok } from "@/presentation/http/helpers/http-responses";
import type { Controller, HttpRequest, HttpResponse } from "@/presentation/http/protocols/http";
import type { Validator } from "@/presentation/http/protocols/validator";

/**
 * Rota **pública** (RF-PUB-01): o comprador não tem conta nem sessão, então
 * `requirePrincipal` não é chamado aqui de propósito.
 */
export class GetPublicCheckoutController implements Controller {
  private readonly getPublicCheckoutUseCase: GetPublicCheckoutUseCase;
  private readonly validator: Validator<GetPublicCheckoutInput>;

  constructor(
    getPublicCheckoutUseCase: GetPublicCheckoutUseCase,
    validator: Validator<GetPublicCheckoutInput>,
  ) {
    this.getPublicCheckoutUseCase = getPublicCheckoutUseCase;
    this.validator = validator;
  }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const input = this.validator.validate({ ...request.query, ...request.params });

    return ok(await this.getPublicCheckoutUseCase.execute(input));
  }
}
