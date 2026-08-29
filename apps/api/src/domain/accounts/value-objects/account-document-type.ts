import { DOCUMENT_KINDS, type DocumentKind } from "@/domain/shared/value-objects/document";

/**
 * O tipo do documento da conta é exatamente o do value object `Document` — uma
 * lista só, para que o `pgEnum` e a validação de dígito verificador nunca
 * divirjam.
 */
export const ACCOUNT_DOCUMENT_TYPES = DOCUMENT_KINDS;

export type AccountDocumentType = DocumentKind;
