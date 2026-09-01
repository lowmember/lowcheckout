/**
 * Duas memórias locais do comprador — e nada além disso.
 *
 * Toda leitura e escrita é protegida: em aba anônima, com cookies de terceiros
 * bloqueados ou com o storage cheio, o acesso **lança**. Um checkout não pode
 * deixar de abrir porque o navegador recusou guardar uma chave, então a falha
 * sempre degrada para "não lembro de nada" em vez de subir.
 */

const VISITOR_ID_KEY = "lc:visitor-id";
const ORDER_ID_PREFIX = "lc:order:";

function read(storage: Storage, key: string): string | null {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function write(storage: Storage, key: string, value: string): void {
  try {
    storage.setItem(key, value);
  } catch {
    // Sem persistência o fluxo continua; só perde a lembrança.
  }
}

function remove(storage: Storage, key: string): void {
  try {
    storage.removeItem(key);
  } catch {
    // idem.
  }
}

/**
 * Identidade anônima do visitante, usada pelo funil (RF-PUB-08). Quem gera é a
 * API: ela devolve o `visitorId` da primeira visita e nós o repetimos nas
 * chamadas seguintes, para que página, PIX e compra caiam na mesma sessão.
 *
 * Vive no `localStorage` porque atravessa visitas — é o que permite reconhecer
 * quem voltou dois dias depois pelo mesmo anúncio.
 */
export function readVisitorId(): string | null {
  return read(localStorage, VISITOR_ID_KEY);
}

export function persistVisitorId(visitorId: string): void {
  write(localStorage, VISITOR_ID_KEY, visitorId);
}

/**
 * Pedido em andamento, por checkout.
 *
 * Sem isto, recarregar a tela do PIX — ou voltar para ela depois de abrir o app
 * do banco, que é exatamente o que o comprador faz — jogaria fora o QR Code e
 * pediria os dados de novo. Fica no `sessionStorage`: é lembrança da compra
 * atual, não histórico.
 */
export function readPendingOrderId(publicSlug: string): string | null {
  return read(sessionStorage, ORDER_ID_PREFIX + publicSlug);
}

export function persistPendingOrderId(publicSlug: string, orderId: string): void {
  write(sessionStorage, ORDER_ID_PREFIX + publicSlug, orderId);
}

export function forgetPendingOrder(publicSlug: string): void {
  remove(sessionStorage, ORDER_ID_PREFIX + publicSlug);
}
