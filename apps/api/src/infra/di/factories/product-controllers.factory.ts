import { DefaultCreateProductUseCase } from "@/application/products/use-cases/create-product.usecase";
import { DefaultGetProductUseCase } from "@/application/products/use-cases/get-product.usecase";
import { DefaultListProductsUseCase } from "@/application/products/use-cases/list-products.usecase";
import { DefaultUpdateProductUseCase } from "@/application/products/use-cases/update-product.usecase";
import { getContainer } from "@/infra/di/container";
import { withOnboardedAccount, withPanelAccess } from "@/infra/di/factories/with-account-guard";
import { withErrorHandling } from "@/infra/di/factories/with-error-handling";
import {
  createProductSchema,
  getProductSchema,
  listProductsSchema,
  updateProductSchema,
} from "@/infra/validation/zod/schemas/product.schemas";
import { ZodValidator } from "@/infra/validation/zod/zod-validator.adapter";
import { CreateProductController } from "@/presentation/http/controllers/products/create-product.controller";
import { GetProductController } from "@/presentation/http/controllers/products/get-product.controller";
import { ListProductsController } from "@/presentation/http/controllers/products/list-products.controller";
import { UpdateProductController } from "@/presentation/http/controllers/products/update-product.controller";

export function makeListProductsController() {
  const { productsRepository, offersRepository } = getContainer();

  return withErrorHandling(
    new ListProductsController(
      withPanelAccess(new DefaultListProductsUseCase(productsRepository, offersRepository)),
      new ZodValidator(listProductsSchema),
    ),
  );
}

export function makeGetProductController() {
  const { productsRepository } = getContainer();

  return withErrorHandling(
    new GetProductController(
      withPanelAccess(new DefaultGetProductUseCase(productsRepository)),
      new ZodValidator(getProductSchema),
    ),
  );
}

export function makeCreateProductController() {
  const { productsRepository, idGenerator, clock } = getContainer();

  return withErrorHandling(
    new CreateProductController(
      withOnboardedAccount(new DefaultCreateProductUseCase(productsRepository, idGenerator, clock)),
      new ZodValidator(createProductSchema),
    ),
  );
}

export function makeUpdateProductController() {
  const { productsRepository, offersRepository, clock } = getContainer();

  return withErrorHandling(
    new UpdateProductController(
      withOnboardedAccount(
        new DefaultUpdateProductUseCase(productsRepository, offersRepository, clock),
      ),
      new ZodValidator(updateProductSchema),
    ),
  );
}
