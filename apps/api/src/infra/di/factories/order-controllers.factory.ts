import { DefaultListOrdersUseCase } from "@/application/orders/use-cases/list-orders.usecase";
import { getContainer } from "@/infra/di/container";
import { withPanelAccess } from "@/infra/di/factories/with-account-guard";
import { withErrorHandling } from "@/infra/di/factories/with-error-handling";
import { listOrdersSchema } from "@/infra/validation/zod/schemas/order.schemas";
import { ZodValidator } from "@/infra/validation/zod/zod-validator.adapter";
import { ListOrdersController } from "@/presentation/http/controllers/orders/list-orders.controller";

export function makeListOrdersController() {
  const { ordersRepository } = getContainer();

  return withErrorHandling(
    new ListOrdersController(
      withPanelAccess(new DefaultListOrdersUseCase(ordersRepository)),
      new ZodValidator(listOrdersSchema),
    ),
  );
}
