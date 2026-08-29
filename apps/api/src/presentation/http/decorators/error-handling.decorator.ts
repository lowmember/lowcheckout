import type { Logger } from "@/application/shared/ports/logger";
import {
  AuthenticationFailedError,
  ConflictError,
  DomainError,
  EntityNotFoundError,
  InvariantViolationError,
  OperationNotAllowedError,
  ServiceUnavailableError,
} from "@/domain/shared/errors/domain.error";
import { UnauthorizedError } from "@/presentation/http/errors/unauthorized.error";
import { ValidationError } from "@/presentation/http/errors/validation.error";
import { failure } from "@/presentation/http/helpers/http-responses";
import type { Controller, HttpRequest, HttpResponse } from "@/presentation/http/protocols/http";

/**
 * Traduz erros em respostas HTTP sem que os controllers precisem de try/catch.
 * Aberto para extensão (novos erros de domínio), fechado para modificação dos controllers.
 */
export class ErrorHandlingController implements Controller {
  private readonly controller: Controller;
  private readonly logger: Logger;

  constructor(controller: Controller, logger: Logger) {
    this.controller = controller;
    this.logger = logger;
  }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    try {
      return await this.controller.handle(request);
    } catch (error) {
      return this.toHttpResponse(error);
    }
  }

  private toHttpResponse(error: unknown): HttpResponse {
    if (error instanceof UnauthorizedError) {
      return failure(401, error.message, error.code);
    }

    if (error instanceof ValidationError) {
      return failure(422, error.message, error.code, error.issues);
    }

    if (error instanceof AuthenticationFailedError) {
      return failure(401, error.message, error.code);
    }

    if (error instanceof EntityNotFoundError) {
      return failure(404, error.message, error.code);
    }

    if (error instanceof OperationNotAllowedError) {
      return failure(403, error.message, error.code);
    }

    if (error instanceof ConflictError) {
      return failure(409, error.message, error.code);
    }

    if (error instanceof InvariantViolationError) {
      return failure(400, error.message, error.code);
    }

    if (error instanceof ServiceUnavailableError) {
      return failure(503, error.message, error.code);
    }

    if (error instanceof DomainError) {
      return failure(400, error.message, error.code);
    }

    this.logger.error("unhandled_error", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return failure(500, "Erro interno do servidor", "internal_error");
  }
}
