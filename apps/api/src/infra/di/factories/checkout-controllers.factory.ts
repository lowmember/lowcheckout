import { DefaultConfirmCheckoutContactEmailUseCase } from "@/application/checkouts/use-cases/confirm-checkout-contact-email.usecase";
import { DefaultCreateCheckoutUseCase } from "@/application/checkouts/use-cases/create-checkout.usecase";
import { DefaultDeleteCheckoutUseCase } from "@/application/checkouts/use-cases/delete-checkout.usecase";
import { DefaultGetCheckoutUseCase } from "@/application/checkouts/use-cases/get-checkout.usecase";
import { DefaultLinkOfferToCheckoutUseCase } from "@/application/checkouts/use-cases/link-offer-to-checkout.usecase";
import { DefaultListCheckoutOffersUseCase } from "@/application/checkouts/use-cases/list-checkout-offers.usecase";
import { DefaultListCheckoutPixelsUseCase } from "@/application/checkouts/use-cases/list-checkout-pixels.usecase";
import { DefaultListCheckoutsUseCase } from "@/application/checkouts/use-cases/list-checkouts.usecase";
import { DefaultReplaceCheckoutPixelsUseCase } from "@/application/checkouts/use-cases/replace-checkout-pixels.usecase";
import { DefaultRequestCheckoutContactEmailVerificationUseCase } from "@/application/checkouts/use-cases/request-checkout-contact-email-verification.usecase";
import { DefaultUnlinkOfferFromCheckoutUseCase } from "@/application/checkouts/use-cases/unlink-offer-from-checkout.usecase";
import { DefaultUpdateCheckoutUseCase } from "@/application/checkouts/use-cases/update-checkout.usecase";
import { DefaultUpdateCheckoutCustomizationUseCase } from "@/application/checkouts/use-cases/update-checkout-customization.usecase";
import { getContainer } from "@/infra/di/container";
import { withOnboardedAccount, withPanelAccess } from "@/infra/di/factories/with-account-guard";
import { withErrorHandling } from "@/infra/di/factories/with-error-handling";
import {
  confirmCheckoutContactEmailSchema,
  createCheckoutSchema,
  deleteCheckoutSchema,
  getCheckoutSchema,
  linkOfferToCheckoutSchema,
  listCheckoutOffersSchema,
  listCheckoutPixelsSchema,
  listCheckoutsSchema,
  replaceCheckoutPixelsSchema,
  requestCheckoutContactEmailVerificationSchema,
  unlinkOfferFromCheckoutSchema,
  updateCheckoutCustomizationSchema,
  updateCheckoutSchema,
} from "@/infra/validation/zod/schemas/checkout.schemas";
import { ZodValidator } from "@/infra/validation/zod/zod-validator.adapter";
import { ConfirmCheckoutContactEmailController } from "@/presentation/http/controllers/checkouts/confirm-checkout-contact-email.controller";
import { CreateCheckoutController } from "@/presentation/http/controllers/checkouts/create-checkout.controller";
import { DeleteCheckoutController } from "@/presentation/http/controllers/checkouts/delete-checkout.controller";
import { GetCheckoutController } from "@/presentation/http/controllers/checkouts/get-checkout.controller";
import { LinkOfferToCheckoutController } from "@/presentation/http/controllers/checkouts/link-offer-to-checkout.controller";
import { ListCheckoutOffersController } from "@/presentation/http/controllers/checkouts/list-checkout-offers.controller";
import { ListCheckoutPixelsController } from "@/presentation/http/controllers/checkouts/list-checkout-pixels.controller";
import { ListCheckoutsController } from "@/presentation/http/controllers/checkouts/list-checkouts.controller";
import { ReplaceCheckoutPixelsController } from "@/presentation/http/controllers/checkouts/replace-checkout-pixels.controller";
import { RequestCheckoutContactEmailVerificationController } from "@/presentation/http/controllers/checkouts/request-checkout-contact-email-verification.controller";
import { UnlinkOfferFromCheckoutController } from "@/presentation/http/controllers/checkouts/unlink-offer-from-checkout.controller";
import { UpdateCheckoutController } from "@/presentation/http/controllers/checkouts/update-checkout.controller";
import { UpdateCheckoutCustomizationController } from "@/presentation/http/controllers/checkouts/update-checkout-customization.controller";

export function makeListCheckoutsController() {
  const { checkoutsRepository } = getContainer();

  return withErrorHandling(
    new ListCheckoutsController(
      withPanelAccess(new DefaultListCheckoutsUseCase(checkoutsRepository)),
      new ZodValidator(listCheckoutsSchema),
    ),
  );
}

export function makeGetCheckoutController() {
  const { checkoutsRepository } = getContainer();

  return withErrorHandling(
    new GetCheckoutController(
      withPanelAccess(new DefaultGetCheckoutUseCase(checkoutsRepository)),
      new ZodValidator(getCheckoutSchema),
    ),
  );
}

export function makeCreateCheckoutController() {
  const { checkoutsRepository, productsRepository, idGenerator, clock } = getContainer();

  return withErrorHandling(
    new CreateCheckoutController(
      withOnboardedAccount(
        new DefaultCreateCheckoutUseCase(
          checkoutsRepository,
          productsRepository,
          idGenerator,
          clock,
        ),
      ),
      new ZodValidator(createCheckoutSchema),
    ),
  );
}

export function makeUpdateCheckoutController() {
  const { checkoutsRepository, clock } = getContainer();

  return withErrorHandling(
    new UpdateCheckoutController(
      withOnboardedAccount(new DefaultUpdateCheckoutUseCase(checkoutsRepository, clock)),
      new ZodValidator(updateCheckoutSchema),
    ),
  );
}

export function makeDeleteCheckoutController() {
  const { checkoutsRepository } = getContainer();

  return withErrorHandling(
    new DeleteCheckoutController(
      withOnboardedAccount(new DefaultDeleteCheckoutUseCase(checkoutsRepository)),
      new ZodValidator(deleteCheckoutSchema),
    ),
  );
}

export function makeLinkOfferToCheckoutController() {
  const {
    checkoutOffersRepository,
    checkoutsRepository,
    offersRepository,
    idGenerator,
    secretGenerator,
    clock,
  } = getContainer();

  return withErrorHandling(
    new LinkOfferToCheckoutController(
      withOnboardedAccount(
        new DefaultLinkOfferToCheckoutUseCase(
          checkoutOffersRepository,
          checkoutsRepository,
          offersRepository,
          idGenerator,
          secretGenerator,
          clock,
        ),
      ),
      new ZodValidator(linkOfferToCheckoutSchema),
    ),
  );
}

export function makeUnlinkOfferFromCheckoutController() {
  const { checkoutOffersRepository, checkoutsRepository } = getContainer();

  return withErrorHandling(
    new UnlinkOfferFromCheckoutController(
      withOnboardedAccount(
        new DefaultUnlinkOfferFromCheckoutUseCase(checkoutOffersRepository, checkoutsRepository),
      ),
      new ZodValidator(unlinkOfferFromCheckoutSchema),
    ),
  );
}

export function makeListCheckoutOffersController() {
  const { checkoutOffersRepository, checkoutsRepository, offersRepository, productsRepository } =
    getContainer();

  return withErrorHandling(
    new ListCheckoutOffersController(
      withPanelAccess(
        new DefaultListCheckoutOffersUseCase(
          checkoutOffersRepository,
          checkoutsRepository,
          offersRepository,
          productsRepository,
        ),
      ),
      new ZodValidator(listCheckoutOffersSchema),
    ),
  );
}

export function makeUpdateCheckoutCustomizationController() {
  const { checkoutsRepository, checkoutCustomizationRevisionsRepository, idGenerator, clock } =
    getContainer();

  return withErrorHandling(
    new UpdateCheckoutCustomizationController(
      withOnboardedAccount(
        new DefaultUpdateCheckoutCustomizationUseCase(
          checkoutsRepository,
          checkoutCustomizationRevisionsRepository,
          idGenerator,
          clock,
        ),
      ),
      new ZodValidator(updateCheckoutCustomizationSchema),
    ),
  );
}

export function makeListCheckoutPixelsController() {
  const { checkoutPixelsRepository, checkoutsRepository } = getContainer();

  return withErrorHandling(
    new ListCheckoutPixelsController(
      withPanelAccess(
        new DefaultListCheckoutPixelsUseCase(checkoutPixelsRepository, checkoutsRepository),
      ),
      new ZodValidator(listCheckoutPixelsSchema),
    ),
  );
}

export function makeReplaceCheckoutPixelsController() {
  const { checkoutPixelsRepository, checkoutsRepository, encrypter, idGenerator, clock } =
    getContainer();

  return withErrorHandling(
    new ReplaceCheckoutPixelsController(
      withOnboardedAccount(
        new DefaultReplaceCheckoutPixelsUseCase(
          checkoutPixelsRepository,
          checkoutsRepository,
          encrypter,
          idGenerator,
          clock,
        ),
      ),
      new ZodValidator(replaceCheckoutPixelsSchema),
    ),
  );
}

export function makeRequestCheckoutContactEmailVerificationController() {
  const { checkoutsRepository, verificationCodeGenerator, hasher, mailer, clock } = getContainer();

  return withErrorHandling(
    new RequestCheckoutContactEmailVerificationController(
      withOnboardedAccount(
        new DefaultRequestCheckoutContactEmailVerificationUseCase(
          checkoutsRepository,
          verificationCodeGenerator,
          hasher,
          mailer,
          clock,
        ),
      ),
      new ZodValidator(requestCheckoutContactEmailVerificationSchema),
    ),
  );
}

export function makeConfirmCheckoutContactEmailController() {
  const { checkoutsRepository, hasher, clock } = getContainer();

  return withErrorHandling(
    new ConfirmCheckoutContactEmailController(
      withOnboardedAccount(
        new DefaultConfirmCheckoutContactEmailUseCase(checkoutsRepository, hasher, clock),
      ),
      new ZodValidator(confirmCheckoutContactEmailSchema),
    ),
  );
}
