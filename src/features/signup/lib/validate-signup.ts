import { isValidCnpj, isValidCpf } from "@/features/signup/lib/document";
import { onlyDigits } from "@/features/signup/lib/masks";
import type { SignupFieldErrors, SignupFormValues } from "@/features/signup/types/signup";

export function validateSignup(values: SignupFormValues): SignupFieldErrors {
  const errors: SignupFieldErrors = {};
  const document = onlyDigits(values.document);
  const phone = onlyDigits(values.phone);

  if (values.accountType === "cpf") {
    if (!document) errors.document = "Informe seu CPF.";
    else if (!isValidCpf(document)) errors.document = "CPF inválido.";
  } else {
    if (!document) errors.document = "Informe seu CNPJ.";
    else if (!isValidCnpj(document)) errors.document = "CNPJ inválido.";
  }

  if (!phone) errors.phone = "Informe seu telefone.";
  else if (phone.length < 10) errors.phone = "Telefone incompleto.";

  return errors;
}
