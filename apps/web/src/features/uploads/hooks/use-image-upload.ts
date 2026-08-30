import { useMutation } from "@tanstack/react-query";

import { createImageUpload, uploadFileToStorage } from "@/features/uploads/api/uploads.api";
import {
  MAX_UPLOAD_IMAGE_SIZE_IN_BYTES,
  UPLOAD_IMAGE_CONTENT_TYPES,
  type UploadImageContentType,
} from "@/features/uploads/types/upload";
import { getApiErrorMessage } from "@/shared/api/get-error-message";

interface UseImageUploadOptions {
  onSuccess?: (fileUrl: string) => void;
}

/**
 * Duas etapas, uma chamada: a API assina, o navegador envia. Recusar o arquivo
 * antes de assinar poupa uma ida à API — a mesma regra é reaplicada lá e no S3,
 * então isto é conveniência, não a única barreira.
 */
export function useImageUpload({ onSuccess }: UseImageUploadOptions = {}) {
  const { mutateAsync, isPending, isError, error, reset } = useMutation({
    mutationFn: async (file: File) => {
      const rejection = rejectUnsupportedFile(file);

      if (rejection) {
        throw new Error(rejection);
      }

      const ticket = await createImageUpload(file);

      return uploadFileToStorage(ticket, file);
    },
    onSuccess,
  });

  return {
    uploadImage: mutateAsync,
    isUploadingImage: isPending,
    hasUploadImageError: isError,
    uploadImageErrorMessage: toErrorMessage(error),
    resetImageUpload: reset,
  };
}

function rejectUnsupportedFile(file: File): string | null {
  if (!UPLOAD_IMAGE_CONTENT_TYPES.includes(file.type as UploadImageContentType)) {
    return "Formato não suportado. Envie PNG, JPEG, WebP ou AVIF.";
  }

  if (file.size > MAX_UPLOAD_IMAGE_SIZE_IN_BYTES) {
    return "A imagem deve ter no máximo 5 MB.";
  }

  return null;
}

/**
 * O erro tanto pode vir da API (503 quando o ambiente não tem bucket) quanto do
 * `PUT` no S3 ou da recusa local — a mensagem da API ganha, e o resto cai na
 * mensagem que o próprio erro carrega.
 */
function toErrorMessage(error: unknown) {
  return getApiErrorMessage(
    error,
    error instanceof Error ? error.message : "Não foi possível enviar a imagem.",
  );
}
