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

export function maskCnpj(value: string) {
  const digits = onlyDigits(value).slice(0, 14);

  let masked = digits.slice(0, 2);
  if (digits.length > 2) masked += `.${digits.slice(2, 5)}`;
  if (digits.length > 5) masked += `.${digits.slice(5, 8)}`;
  if (digits.length > 8) masked += `/${digits.slice(8, 12)}`;
  if (digits.length > 12) masked += `-${digits.slice(12, 14)}`;

  return masked;
}

export function maskPhone(value: string) {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;

  const prefixEnd = digits.length > 10 ? 7 : 6;
  const prefix = digits.slice(2, prefixEnd);
  const suffix = digits.slice(prefixEnd);

  return suffix
    ? `(${digits.slice(0, 2)}) ${prefix}-${suffix}`
    : `(${digits.slice(0, 2)}) ${prefix}`;
}

/** Exibe CPF/CNPJ já formatado a partir dos dígitos vindos da API. */
export function formatDocument(document: string, documentType: "cpf" | "cnpj") {
  return documentType === "cpf" ? maskCpf(document) : maskCnpj(document);
}
