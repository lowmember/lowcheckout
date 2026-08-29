export interface ValidationIssue {
  path: string;
  message: string;
}

export class ValidationError extends Error {
  readonly code = "validation_error";
  readonly issues: readonly ValidationIssue[];

  constructor(issues: readonly ValidationIssue[]) {
    super("Dados da requisição inválidos");
    this.name = "ValidationError";
    this.issues = issues;
  }
}
