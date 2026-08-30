import { z } from "zod";

import { ORDER_STATUSES } from "../orders";
import { paginationSchema } from "./shared.schemas";

export const listOrdersSchema = paginationSchema.extend({
  status: z.enum(ORDER_STATUSES).optional(),
  /** Nome ou e-mail do comprador. */
  search: z.string().trim().min(1).optional(),
});

export type ListOrdersParams = z.input<typeof listOrdersSchema>;
