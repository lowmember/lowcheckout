import { z } from "zod";

import { OFFER_STATUSES } from "@/domain/offers/value-objects/offer-status";
import {
  idSchema,
  optionalUrlSchema,
  paginationSchema,
} from "@/infra/validation/zod/schemas/shared.schemas";

const offerStatusSchema = z.enum(OFFER_STATUSES);
const offerNameSchema = z.string().trim().min(1).max(120);
const priceInCentsSchema = z.number().int().positive();
const currencySchema = z.string().trim().length(3);

export const listOffersSchema = paginationSchema.extend({
  productId: idSchema,
  status: offerStatusSchema.optional(),
});

export const getOfferSchema = z.object({
  offerId: idSchema,
});

export const createOfferSchema = z.object({
  productId: idSchema,
  name: offerNameSchema,
  priceInCents: priceInCentsSchema,
  currency: currencySchema.default("BRL"),
  deliveryUrl: optionalUrlSchema,
});

export const updateOfferSchema = z
  .object({
    offerId: idSchema,
    name: offerNameSchema.optional(),
    priceInCents: priceInCentsSchema.optional(),
    currency: currencySchema.optional(),
    deliveryUrl: optionalUrlSchema,
    status: offerStatusSchema.optional(),
  })
  .refine(
    ({ offerId: _offerId, ...changes }) =>
      Object.values(changes).some((value) => value !== undefined),
    { error: "Informe ao menos um campo para alterar" },
  );
