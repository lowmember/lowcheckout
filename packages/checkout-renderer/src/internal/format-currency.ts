/** Formata centavos inteiros em moeda pt-BR. Nunca formate dinheiro à mão. */
export function formatCurrency(amountInCents: number, currency = "BRL") {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(
    amountInCents / 100,
  );
}
