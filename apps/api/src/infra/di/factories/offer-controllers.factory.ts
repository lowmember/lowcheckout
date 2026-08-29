import { DefaultCreateOfferUseCase } from "@/application/offers/use-cases/create-offer.usecase";
import { DefaultGetOfferUseCase } from "@/application/offers/use-cases/get-offer.usecase";
import { DefaultListOffersUseCase } from "@/application/offers/use-cases/list-offers.usecase";
import { DefaultUpdateOfferUseCase } from "@/application/offers/use-cases/update-offer.usecase";
import { getContainer } from "@/infra/di/container";
import { withOnboardedAccount, withPanelAccess } from "@/infra/di/factories/with-account-guard";
import { withErrorHandling } from "@/infra/di/factories/with-error-handling";
import {
  createOfferSchema,
  getOfferSchema,
  listOffersSchema,
  updateOfferSchema,
} from "@/infra/validation/zod/schemas/offer.schemas";
import { ZodValidator } from "@/infra/validation/zod/zod-validator.adapter";
import { CreateOfferController } from "@/presentation/http/controllers/offers/create-offer.controller";
import { GetOfferController } from "@/presentation/http/controllers/offers/get-offer.controller";
import { ListOffersController } from "@/presentation/http/controllers/offers/list-offers.controller";
import { UpdateOfferController } from "@/presentation/http/controllers/offers/update-offer.controller";

export function makeListOffersController() {
  const { offersRepository, productsRepository } = getContainer();

  return withErrorHandling(
    new ListOffersController(
      withPanelAccess(new DefaultListOffersUseCase(offersRepository, productsRepository)),
      new ZodValidator(listOffersSchema),
    ),
  );
}

export function makeGetOfferController() {
  const { offersRepository, productsRepository } = getContainer();

  return withErrorHandling(
    new GetOfferController(
      withPanelAccess(new DefaultGetOfferUseCase(offersRepository, productsRepository)),
      new ZodValidator(getOfferSchema),
    ),
  );
}

export function makeCreateOfferController() {
  const { offersRepository, productsRepository, idGenerator, clock } = getContainer();

  return withErrorHandling(
    new CreateOfferController(
      withOnboardedAccount(
        new DefaultCreateOfferUseCase(offersRepository, productsRepository, idGenerator, clock),
      ),
      new ZodValidator(createOfferSchema),
    ),
  );
}

export function makeUpdateOfferController() {
  const { offersRepository, productsRepository, clock } = getContainer();

  return withErrorHandling(
    new UpdateOfferController(
      withOnboardedAccount(
        new DefaultUpdateOfferUseCase(offersRepository, productsRepository, clock),
      ),
      new ZodValidator(updateOfferSchema),
    ),
  );
}
