import type { ExpireDueOrdersUseCase } from "@/application/orders/use-cases/expire-due-orders.usecase";
import { DefaultExpireDueOrdersUseCase } from "@/application/orders/use-cases/expire-due-orders.usecase";
import { getContainer } from "@/infra/di/container";

/**
 * Rotinas agendadas não passam por controller nem por `HttpRequest`: são outro
 * mecanismo de entrega. O que vale é a mesma regra de sempre — o caso de uso
 * recebe portas, e quem amarra o concreto é este arquivo.
 */
export function makeExpireDueOrdersUseCase(): ExpireDueOrdersUseCase {
  const { ordersRepository, orderExpirer, clock, logger } = getContainer();

  return new DefaultExpireDueOrdersUseCase(ordersRepository, orderExpirer, clock, logger);
}
