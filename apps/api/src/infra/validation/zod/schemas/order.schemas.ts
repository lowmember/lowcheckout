import { z } from "zod";

import { ORDER_STATUSES } from "@/domain/orders/value-objects/order-status";
import { paginationSchema } from "@/infra/validation/zod/schemas/shared.schemas";

export const listOrdersSchema = paginationSchema.extend({
  status: z.enum(ORDER_STATUSES).optional(),
  /** Nome ou e-mail do comprador. */
  search: z.string().trim().min(1).optional(),
});
