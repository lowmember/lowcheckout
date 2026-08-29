/**
 * Rotinas agendadas. Mesma ideia das rotas HTTP: nome e agendamento vivem num
 * lugar só, e o `serverless.ts` deriva o bloco `functions` daqui.
 */
export interface ScheduledJobDefinition {
  readonly name: string;
  /** Expressão aceita pelo EventBridge (`rate(...)` ou `cron(...)`). */
  readonly schedule: string;
}

export const scheduledJobs = {
  expireOrders: { name: "expireOrders", schedule: "rate(5 minutes)" },
} as const satisfies Record<string, ScheduledJobDefinition>;

export type ScheduledJobName = keyof typeof scheduledJobs;

export const scheduledJobDefinitions: readonly ScheduledJobDefinition[] =
  Object.values(scheduledJobs);
