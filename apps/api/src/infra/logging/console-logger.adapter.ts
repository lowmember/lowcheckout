import type { Logger } from "@/application/shared/ports/logger";

/** Log estruturado: o CloudWatch indexa JSON, texto solto ele só armazena. */
export class ConsoleLogger implements Logger {
  private readonly enabled: boolean;

  constructor(logLevel: "debug" | "info" | "error") {
    this.enabled = logLevel !== "error";
  }

  info(message: string, context: Record<string, unknown> = {}): void {
    if (!this.enabled) {
      return;
    }

    console.info(JSON.stringify({ level: "info", message, ...context }));
  }

  error(message: string, context: Record<string, unknown> = {}): void {
    console.error(JSON.stringify({ level: "error", message, ...context }));
  }
}
