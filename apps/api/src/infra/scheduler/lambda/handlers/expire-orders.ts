import { makeExpireDueOrdersUseCase } from "@/infra/di/factories/job-factories";

/**
 * RF-PAG-03: expira os pedidos cujo prazo do PIX venceu sem confirmação.
 * Roda a cada poucos minutos — a tela do comprador também expira na leitura,
 * então um atraso aqui não aparece para quem está esperando.
 */
export const handler = async (): Promise<{ scanned: number; expired: number }> =>
  makeExpireDueOrdersUseCase().execute({});
