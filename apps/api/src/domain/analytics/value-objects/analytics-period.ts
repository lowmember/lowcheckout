import { InvariantViolationError } from "@/domain/shared/errors/domain.error";

/**
 * Fuso de referência de todo agrupamento do analytics (RNF de timezone): o
 * armazenamento é UTC, o recorte é São Paulo.
 */
export const ANALYTICS_TIME_ZONE = "America/Sao_Paulo";

/** Granularidade da série (RF-ANL-04): horária dentro de um dia, diária no resto. */
export const ANALYTICS_GRANULARITIES = ["hour", "day"] as const;

export type AnalyticsGranularity = (typeof ANALYTICS_GRANULARITIES)[number];

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
const DEFAULT_SPAN_DAYS = 7;
const MAX_SPAN_DAYS = 366;
/** Acima disso o período deixa de ser "hoje" e a série vira diária. */
const HOURLY_SPAN_LIMIT_MS = 36 * 60 * 60 * 1000;

export class AnalyticsPeriod {
  private readonly from: Date;
  private readonly to: Date;

  private constructor(from: Date, to: Date) {
    this.from = from;
    this.to = to;
  }

  /** Sem intervalo informado, vale o padrão de 7 dias da home (S18). */
  static create(input: { from?: Date | null; to?: Date | null; now: Date }): AnalyticsPeriod {
    const to = input.to ?? input.now;
    const from = input.from ?? new Date(to.getTime() - DEFAULT_SPAN_DAYS * MILLISECONDS_PER_DAY);

    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      throw new InvariantViolationError("Período inválido");
    }

    if (to.getTime() < from.getTime()) {
      throw new InvariantViolationError("A data final não pode ser anterior à inicial");
    }

    if (to.getTime() - from.getTime() > MAX_SPAN_DAYS * MILLISECONDS_PER_DAY) {
      throw new InvariantViolationError(`O período não pode ser maior que ${MAX_SPAN_DAYS} dias`);
    }

    return new AnalyticsPeriod(from, to);
  }

  get startsAt(): Date {
    return this.from;
  }

  get endsAt(): Date {
    return this.to;
  }

  /** A granularidade acompanha o período, a menos que a chamada imponha uma. */
  resolveGranularity(requested?: AnalyticsGranularity | null): AnalyticsGranularity {
    if (requested) {
      return requested;
    }

    return this.to.getTime() - this.from.getTime() <= HOURLY_SPAN_LIMIT_MS ? "hour" : "day";
  }
}
