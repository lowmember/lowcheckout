import { DefaultAuthenticateWithGoogleUseCase } from "@/application/auth/use-cases/authenticate-with-google.usecase";
import { DefaultCreateDevSessionUseCase } from "@/application/auth/use-cases/create-dev-session.usecase";
import { DefaultGetMeUseCase } from "@/application/auth/use-cases/get-me.usecase";
import { DefaultLogoutUseCase } from "@/application/auth/use-cases/logout.usecase";
import { DefaultRefreshSessionUseCase } from "@/application/auth/use-cases/refresh-session.usecase";
import { env } from "@/infra/config/env";
import { getContainer, getGoogleIdentityVerifier } from "@/infra/di/container";
import { withErrorHandling } from "@/infra/di/factories/with-error-handling";
import {
  authenticateWithGoogleSchema,
  createDevSessionSchema,
  logoutSchema,
  refreshSessionSchema,
} from "@/infra/validation/zod/schemas/auth.schemas";
import { ZodValidator } from "@/infra/validation/zod/zod-validator.adapter";
import { AuthenticateWithGoogleController } from "@/presentation/http/controllers/auth/authenticate-with-google.controller";
import { CreateDevSessionController } from "@/presentation/http/controllers/auth/create-dev-session.controller";
import { GetMeController } from "@/presentation/http/controllers/auth/get-me.controller";
import { LogoutController } from "@/presentation/http/controllers/auth/logout.controller";
import { RefreshSessionController } from "@/presentation/http/controllers/auth/refresh-session.controller";

export function makeAuthenticateWithGoogleController() {
  const { usersRepository, accountsRepository, sessionIssuer, idGenerator, clock } = getContainer();

  return withErrorHandling(
    new AuthenticateWithGoogleController(
      new DefaultAuthenticateWithGoogleUseCase(
        getGoogleIdentityVerifier(),
        usersRepository,
        accountsRepository,
        sessionIssuer,
        idGenerator,
        clock,
      ),
      new ZodValidator(authenticateWithGoogleSchema),
    ),
  );
}

export function makeRefreshSessionController() {
  const {
    refreshTokensRepository,
    usersRepository,
    accountsRepository,
    sessionIssuer,
    hasher,
    clock,
  } = getContainer();

  return withErrorHandling(
    new RefreshSessionController(
      new DefaultRefreshSessionUseCase(
        refreshTokensRepository,
        usersRepository,
        accountsRepository,
        sessionIssuer,
        hasher,
        clock,
      ),
      new ZodValidator(refreshSessionSchema),
    ),
  );
}

export function makeLogoutController() {
  const { refreshTokensRepository, hasher, clock } = getContainer();

  return withErrorHandling(
    new LogoutController(
      new DefaultLogoutUseCase(refreshTokensRepository, hasher, clock),
      new ZodValidator(logoutSchema),
    ),
  );
}

export function makeGetMeController() {
  const { usersRepository, accountsRepository } = getContainer();

  // Sem guarda de conta de propósito: é esta rota que informa o estado dela.
  return withErrorHandling(
    new GetMeController(new DefaultGetMeUseCase(usersRepository, accountsRepository)),
  );
}

/** TODO(RF-AUTH-01): sai junto com o fallback `x-account-id` quando o OAuth ligar. */
export function makeCreateDevSessionController() {
  const { usersRepository, accountsRepository, sessionIssuer, idGenerator, clock } = getContainer();

  return withErrorHandling(
    new CreateDevSessionController(
      new DefaultCreateDevSessionUseCase(
        usersRepository,
        accountsRepository,
        sessionIssuer,
        idGenerator,
        clock,
        env.stage !== "prod",
      ),
      new ZodValidator(createDevSessionSchema),
    ),
  );
}
