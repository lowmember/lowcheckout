/**
 * Upload de imagens (produto, oferta e seções do checkout).
 *
 * O arquivo nunca passa pela API: ela só assina uma URL e o navegador faz o
 * `PUT` direto no S3 — é o que mantém o upload fora do limite de payload do
 * Lambda. A API devolve, junto, a URL pública definitiva, que é o valor gravado
 * nos campos `imageUrl` do domínio.
 */

export const UPLOAD_IMAGE_CONTENT_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/avif",
] as const;

export type UploadImageContentType = (typeof UPLOAD_IMAGE_CONTENT_TYPES)[number];

/** 5 MB: teto de produto, aplicado no domínio e reforçado na assinatura da URL. */
export const MAX_UPLOAD_IMAGE_SIZE_IN_BYTES = 5 * 1024 * 1024;

export interface ImageUploadTicket {
  /** URL assinada, de uso único, para o `PUT` do arquivo. */
  uploadUrl: string;
  /** Cabeçalhos que o `PUT` precisa repetir — a assinatura os cobre. */
  uploadHeaders: Record<string, string>;
  /** URL pública e definitiva do objeto: é o que vai para `imageUrl`. */
  fileUrl: string;
  expiresInSeconds: number;
}
