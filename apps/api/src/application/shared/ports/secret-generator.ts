/** Gera segredos opacos de alta entropia (refresh token, chaves de uso único). */
export interface SecretGenerator {
  generate(): string;
}
