export class UnknownRouteError extends Error {
  readonly code = "unknown_route";

  constructor(name: string) {
    super(`Nenhuma rota registrada com o nome "${name}"`);
    this.name = "UnknownRouteError";
  }
}
