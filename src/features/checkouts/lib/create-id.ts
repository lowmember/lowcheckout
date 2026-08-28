/** Id local de seção/item de lista. Nunca vai para o banco como chave primária. */
export function createLocalId(prefix: string) {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);

  return `${prefix}-${random}`;
}
