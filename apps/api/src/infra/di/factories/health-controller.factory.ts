import { env } from "@/infra/config/env";
import { getContainer } from "@/infra/di/container";
import { withErrorHandling } from "@/infra/di/factories/with-error-handling";
import { DatabaseHealthCheck } from "@/infra/persistence/drizzle/database.health-check";
import { HealthController } from "@/presentation/http/controllers/health.controller";

export function makeHealthController() {
  const { database } = getContainer();

  return withErrorHandling(new HealthController(env.stage, [new DatabaseHealthCheck(database)]));
}
