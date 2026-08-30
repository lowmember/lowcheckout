import type {
  CreateImageUploadInput,
  CreateImageUploadUseCase,
} from "@/application/uploads/use-cases/create-image-upload.usecase";
import { created } from "@/presentation/http/helpers/http-responses";
import { requirePrincipal } from "@/presentation/http/helpers/require-principal";
import type { Controller, HttpRequest, HttpResponse } from "@/presentation/http/protocols/http";
import type { Validator } from "@/presentation/http/protocols/validator";

export class CreateImageUploadController implements Controller {
  private readonly createImageUploadUseCase: CreateImageUploadUseCase;
  private readonly validator: Validator<Omit<CreateImageUploadInput, "accountId">>;

  constructor(
    createImageUploadUseCase: CreateImageUploadUseCase,
    validator: Validator<Omit<CreateImageUploadInput, "accountId">>,
  ) {
    this.createImageUploadUseCase = createImageUploadUseCase;
    this.validator = validator;
  }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const { accountId } = requirePrincipal(request);
    const input = this.validator.validate(request.body);

    return created(await this.createImageUploadUseCase.execute({ ...input, accountId }));
  }
}
