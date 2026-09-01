export function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function maskCpf(value: string) {
  const digits = onlyDigits(value).slice(0, 11);

  let masked = digits.slice(0, 3);
  if (digits.length > 3) masked += `.${digits.slice(3, 6)}`;
  if (digits.length > 6) masked += `.${digits.slice(6, 9)}`;
  if (digits.length > 9) masked += `-${digits.slice(9, 11)}`;

  return masked;
}
