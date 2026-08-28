/** Formata centavos inteiros em moeda pt-BR. Nunca formate dinheiro à mão. */
export function formatCurrency(amountInCents: number, currency = "BRL") {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(
    amountInCents / 100,
  );
}

/** Versão compacta para eixos e rótulos apertados: R$ 12,4 mil. */
export function formatCompactCurrency(amountInCents: number, currency = "BRL") {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amountInCents / 100);
}

/** Converte "1.234,56" ou "1234,56" digitado pelo usuário em centavos. */
export function parseCurrencyToCents(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length === 0 ? 0 : Number(digits);
}

/** Máscara de digitação para valores monetários: sempre duas casas. */
export function maskCurrency(value: string) {
  const cents = parseCurrencyToCents(value);
  return new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2 }).format(cents / 100);
}
