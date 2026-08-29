/**
 * Quem está fazendo a requisição, já resolvido. Vive na `application/` porque é
 * a entrada de todo caso de uso multi-tenant; a apresentação apenas o repassa.
 */
export interface Principal {
  accountId: string;
  userId: string;
}
