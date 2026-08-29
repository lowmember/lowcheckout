import { getContainer } from "@/infra/di/container";
import { ErrorHandlingController } from "@/presentation/http/decorators/error-handling.decorator";
import type { Controller } from "@/presentation/http/protocols/http";

export function withErrorHandling(controller: Controller): Controller {
  return new ErrorHandlingController(controller, getContainer().logger);
}
