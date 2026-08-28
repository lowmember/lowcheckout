import { onlyDigits } from "@/shared/lib/masks";

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

export function isValidCnpj(value: string) {
  const digits = onlyDigits(value);

  if (digits.length !== 14 || /^(\d)\1{13}$/.test(digits)) return false;

  function checkDigit(length: number) {
    let sum = 0;
    let weight = length - 7;

    for (let index = 0; index < length; index++) {
      sum += Number(digits[index]) * weight;
      weight = weight - 1 < 2 ? 9 : weight - 1;
    }

    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  }

  return checkDigit(12) === Number(digits[12]) && checkDigit(13) === Number(digits[13]);
}
