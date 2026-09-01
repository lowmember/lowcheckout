import { InvariantViolationError } from "@/domain/shared/errors/domain.error";

/**
 * O que gera uma notificação no painel. Hoje só o ciclo de vida da venda
 * (RF-NOT-01): nasce do pedido, nunca de ação do próprio usuário.
 */
export const NOTIFICATION_TYPES = ["sale_created", "sale_paid", "sale_expired"] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export function toNotificationType(value: string): NotificationType {
  if (!NOTIFICATION_TYPES.includes(value as NotificationType)) {
    throw new InvariantViolationError(`"${value}" não é um tipo de notificação válido`);
  }

  return value as NotificationType;
}
