import type { FileStorage, SignedUpload } from "@/application/uploads/ports/file-storage";
import { ImageUploadUnavailableError } from "@/domain/uploads/errors/image-upload-unavailable.error";

/**
 * Substituto do S3 quando falta `S3_UPLOADS_BUCKET`. Existe para que a ausência
 * de configuração vire uma resposta HTTP honesta (503) — e para que o painel
 * caia no campo de URL, que continua funcionando sem bucket nenhum.
 */
export class UnavailableFileStorage implements FileStorage {
  createSignedUpload(): Promise<SignedUpload> {
    return Promise.reject(new ImageUploadUnavailableError());
  }
}
