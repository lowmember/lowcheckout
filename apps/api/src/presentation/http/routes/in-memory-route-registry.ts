import { UnknownRouteError } from "@/presentation/http/errors/unknown-route.error";
import type { HttpRoute, HttpRouteRegistry } from "@/presentation/http/protocols/http-route";

export class InMemoryHttpRouteRegistry implements HttpRouteRegistry {
  private readonly routes = new Map<string, HttpRoute>();

  register(route: HttpRoute): void {
    if (this.routes.has(route.name)) {
      throw new Error(`Route "${route.name}" is already registered`);
    }

    this.routes.set(route.name, route);
  }

  get(name: string): HttpRoute {
    const route = this.routes.get(name);

    if (!route) {
      throw new UnknownRouteError(name);
    }

    return route;
  }

  all(): readonly HttpRoute[] {
    return [...this.routes.values()];
  }
}
