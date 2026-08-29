import { scheduledJobDefinitions } from "@/infra/scheduler/scheduled-jobs";

/**
 * Traduz as rotinas agendadas em funções do Serverless. Mesma convenção das
 * rotas HTTP: o arquivo do handler é o nome do job em kebab-case.
 */
export const scheduledLambdaFunctions = Object.fromEntries(
  scheduledJobDefinitions.map((job) => [
    job.name,
    {
      handler: `src/infra/scheduler/lambda/handlers/${toKebabCase(job.name)}.handler`,
      events: [{ schedule: job.schedule }],
    },
  ]),
);

function toKebabCase(value: string): string {
  return value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}
