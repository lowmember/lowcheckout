import { onlyDigits } from "@lowcheckout/checkout-renderer";

/**
 * Só CPF: o comprador é sempre pessoa física no formulário público
 * (RF-PUB-02). O CNPJ, que o painel valida no onboarding, não tem por que
 * pesar no bundle da página que converte.
 */
export function isValidCpf(value: string) {
  const digits = onlyDigits(value);

  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;

  function checkDigit(length: number) {
    let sum = 0;

    for (let index = 0; index < length; index++) {
      sum += Number(digits[index]) * (length + 1 - index);
    }

    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  }

  return checkDigit(9) === Number(digits[9]) && checkDigit(10) === Number(digits[10]);
}
