/**
 * Cifra e decifra credenciais de terceiros antes de tocarem o banco
 * (`gateway_connections.credentials`, `checkout_pixels.access_token`). Um
 * `SELECT` acidental ou um dump não podem virar acesso à conta do cliente.
 *
 * O formato do texto cifrado é decisão da infra; a aplicação só trafega opaco.
 */
export interface Encrypter {
  encrypt(plainText: string): string;
  decrypt(cipherText: string): string;
}
