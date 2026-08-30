import { z } from "zod";

import { MAX_UPLOAD_IMAGE_SIZE_IN_BYTES, UPLOAD_IMAGE_CONTENT_TYPES } from "../uploads";

export const createImageUploadSchema = z.object({
  contentType: z.enum(UPLOAD_IMAGE_CONTENT_TYPES, {
    error: "Formato não suportado. Envie PNG, JPEG, WebP ou AVIF",
  }),
  /**
   * Vai assinado como `content-length`: sem ele a URL assinada aceitaria
   * qualquer tamanho, e o teto de 5 MB só existiria no navegador.
   */
  sizeInBytes: z
    .int()
    .positive()
    .max(MAX_UPLOAD_IMAGE_SIZE_IN_BYTES, { error: "A imagem deve ter no máximo 5 MB" }),
});

export type CreateImageUploadInput = z.input<typeof createImageUploadSchema>;
