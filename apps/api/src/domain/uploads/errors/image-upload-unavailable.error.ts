import { ServiceUnavailableError } from "@/domain/shared/errors/domain.error";

/** O ambiente não tem bucket configurado: envio indisponível, não inválido. */
export class ImageUploadUnavailableError extends ServiceUnavailableError {
  override readonly code = "image_upload_unavailable";

  constructor() {
    super(
      "O envio de imagens não está disponível neste ambiente. " +
        "Informe a URL da imagem ou configure S3_UPLOADS_BUCKET",
    );
  }
}
