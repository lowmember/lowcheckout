/**
 * Reexporta o contrato do upload. A definição vive em `@lowcheckout/contracts`
 * porque a API valida exatamente estes formatos e este teto de tamanho — dois
 * lados da mesma regra não podem divergir.
 */

export type { ImageUploadTicket, UploadImageContentType } from "@lowcheckout/contracts";
export {
  MAX_UPLOAD_IMAGE_SIZE_IN_BYTES,
  UPLOAD_IMAGE_CONTENT_TYPES,
} from "@lowcheckout/contracts";
