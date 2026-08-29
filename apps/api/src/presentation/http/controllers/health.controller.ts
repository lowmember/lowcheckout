import { ok } from "@/presentation/http/helpers/http-responses";
import type { Controller, HttpResponse } from "@/presentation/http/protocols/http";

export interface HealthCheck {
  name: string;
  check(): Promise<boolean>;
}

export class HealthController implements Controller {
  private readonly stage: string;
  private readonly checks: readonly HealthCheck[];

  constructor(stage: string, checks: readonly HealthCheck[]) {
    this.stage = stage;
    this.checks = checks;
  }

  async handle(): Promise<HttpResponse> {
    const results = await Promise.all(
      this.checks.map(
        async (check) => [check.name, await check.check().catch(() => false)] as const,
      ),
    );

    const isHealthy = results.every(([, healthy]) => healthy);

    return {
      ...ok({
        status: isHealthy ? "ok" : "degraded",
        stage: this.stage,
        dependencies: Object.fromEntries(
          results.map(([name, healthy]) => [name, healthy ? "up" : "down"]),
        ),
        timestamp: new Date().toISOString(),
      }),
      statusCode: isHealthy ? 200 : 503,
    };
  }
}
