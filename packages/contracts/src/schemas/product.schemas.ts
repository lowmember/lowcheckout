import { z } from "zod";

import { PRODUCT_STATUSES } from "../products";
import { idSchema, optionalUrlSchema, paginationSchema } from "./shared.schemas";

const productStatusSchema = z.enum(PRODUCT_STATUSES);
const productNameSchema = z.string().trim().min(1).max(120);
const productDescriptionSchema = z.string().trim().max(5000).nullable().optional();

export const listProductsSchema = paginationSchema.extend({
  status: productStatusSchema.optional(),
  search: z.string().trim().min(1).optional(),
});

export const getProductSchema = z.object({
  productId: idSchema,
});

export const createProductSchema = z.object({
  name: productNameSchema,
  description: productDescriptionSchema,
  imageUrl: optionalUrlSchema,
  defaultDeliveryUrl: optionalUrlSchema,
});

export const updateProductSchema = z
  .object({
    productId: idSchema,
    name: productNameSchema.optional(),
    description: productDescriptionSchema,
    imageUrl: optionalUrlSchema,
    defaultDeliveryUrl: optionalUrlSchema,
  })
  .refine(
    ({ productId: _productId, ...changes }) =>
      Object.values(changes).some((value) => value !== undefined),
    { error: "Informe ao menos um campo para alterar" },
  );

export type ListProductsParams = z.input<typeof listProductsSchema>;
export type CreateProductInput = z.input<typeof createProductSchema>;
export type UpdateProductInput = z.input<typeof updateProductSchema>;
