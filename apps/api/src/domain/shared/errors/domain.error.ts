/**
 * Erro de regra de negócio. Não conhece HTTP, status code ou qualquer detalhe
 * de entrega — a tradução para o protocolo acontece na camada de apresentação.
 */
export abstract class DomainError extends Error {
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class InvariantViolationError extends DomainError {
  readonly code: string = "invariant_violation";
}

export class EntityNotFoundError extends DomainError {
  readonly code: string = "entity_not_found";
}

/**
 * A identidade não pôde ser estabelecida (credencial do provedor recusada) ou
 * deixou de valer (sessão expirada, refresh token revogado).
 */
export class AuthenticationFailedError extends DomainError {
  readonly code: string = "authentication_failed";
}

/**
 * A operação é legítima, o recurso existe e pertence a quem pede — mas o estado
 * atual não permite executá-la (onboarding pendente, conta desativada).
 * Nunca use para acesso entre contas: lá o recurso simplesmente não existe.
 */
export class OperationNotAllowedError extends DomainError {
  readonly code: string = "operation_not_allowed";
}

/** Choque com um estado já existente: documento, e-mail ou vínculo duplicado. */
export class ConflictError extends DomainError {
  readonly code: string = "conflict";
}

/**
 * Uma dependência externa necessária não está disponível ou não foi
 * configurada neste ambiente. Não é culpa de quem chamou — é estado do sistema.
 */
export class ServiceUnavailableError extends DomainError {
  readonly code: string = "service_unavailable";
}
