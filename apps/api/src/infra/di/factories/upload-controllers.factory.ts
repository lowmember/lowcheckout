import { DefaultCreateImageUploadUseCase } from "@/application/uploads/use-cases/create-image-upload.usecase";
import { getContainer, getFileStorage } from "@/infra/di/container";
import { withOnboardedAccount } from "@/infra/di/factories/with-account-guard";
import { withErrorHandling } from "@/infra/di/factories/with-error-handling";
import { createImageUploadSchema } from "@/infra/validation/zod/schemas/upload.schemas";
import { ZodValidator } from "@/infra/validation/zod/zod-validator.adapter";
import { CreateImageUploadController } from "@/presentation/http/controllers/uploads/create-image-upload.controller";

export function makeCreateImageUploadController() {
  const { idGenerator } = getContainer();

  return withErrorHandling(
    new CreateImageUploadController(
      withOnboardedAccount(new DefaultCreateImageUploadUseCase(getFileStorage(), idGenerator)),
      new ZodValidator(createImageUploadSchema),
    ),
  );
}
