import type { SignupFieldErrors, SignupFormValues } from "@/features/signup/types/signup";
import { isValidCnpj, isValidCpf } from "@/shared/lib/document";
import { onlyDigits } from "@/shared/lib/masks";

export function validateSignup(values: SignupFormValues): SignupFieldErrors {
  const errors: SignupFieldErrors = {};
  const businessName = values.businessName.trim();
  const document = onlyDigits(values.document);
  const phone = onlyDigits(values.phone);

  if (!businessName) errors.businessName = "Informe o nome do seu negócio.";
  else if (businessName.length < 2) errors.businessName = "Nome muito curto.";
  else if (businessName.length > 160) errors.businessName = "Nome muito longo.";

  if (values.documentType === "cpf") {
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
