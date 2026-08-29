import { EntityNotFoundError } from "@/domain/shared/errors/domain.error";

export class UserNotFoundError extends EntityNotFoundError {
  override readonly code = "user_not_found";

  constructor(userId: string) {
    super(`Usuário ${userId} não encontrado`);
  }
}
