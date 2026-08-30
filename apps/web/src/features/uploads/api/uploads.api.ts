import type { ImageUploadTicket } from "@/features/uploads/types/upload";
import { httpClient } from "@/shared/api/http-client";
import type { ApiResponse } from "@/shared/api/types";

/** Pede a permissão de escrita: a API assina a URL e devolve a URL pública final. */
export async function createImageUpload(file: File) {
  const response = await httpClient.post<ApiResponse<ImageUploadTicket>>("/uploads/images", {
    contentType: file.type,
    sizeInBytes: file.size,
  });

  return response.data.data;
}

/**
 * Único `fetch` cru do painel, e de propósito: o `httpClient` acrescentaria
 * `baseURL` e o header `Authorization`, e qualquer header a mais invalida a
 * assinatura da URL do S3. O arquivo nunca passa pela API.
 */
export async function uploadFileToStorage(ticket: ImageUploadTicket, file: File) {
  const response = await fetch(ticket.uploadUrl, {
    method: "PUT",
    headers: ticket.uploadHeaders,
    body: file,
  });

  if (!response.ok) {
    throw new Error("Não foi possível enviar a imagem para o armazenamento.");
  }

  return ticket.fileUrl;
}
