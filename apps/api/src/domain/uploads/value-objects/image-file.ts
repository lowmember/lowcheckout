import { InvariantViolationError } from "@/domain/shared/errors/domain.error";

/**
 * Formatos e teto de tamanho da imagem enviada pelo lojista. É regra de
 * produto, não formato de entrada: o zod recusa o que chega torto, mas quem
 * decide o que é uma imagem aceitável é este value object (regra 4).
 */
const ALLOWED_CONTENT_TYPES: Record<string, string | undefined> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/avif": "avif",
};

const MAX_SIZE_IN_BYTES = 5 * 1024 * 1024;

export class ImageFile {
  private readonly contentType: string;
  private readonly sizeInBytes: number;
  private readonly fileExtension: string;

  private constructor(contentType: string, sizeInBytes: number, fileExtension: string) {
    this.contentType = contentType;
    this.sizeInBytes = sizeInBytes;
    this.fileExtension = fileExtension;
  }

  static create(props: { contentType: string; sizeInBytes: number }): ImageFile {
    const contentType = props.contentType.trim().toLowerCase();
    const fileExtension = ALLOWED_CONTENT_TYPES[contentType];

    if (fileExtension === undefined) {
      throw new InvariantViolationError(
        `"${props.contentType}" não é um formato de imagem aceito. Envie PNG, JPEG, WebP ou AVIF`,
      );
    }

    if (!Number.isInteger(props.sizeInBytes) || props.sizeInBytes <= 0) {
      throw new InvariantViolationError("O tamanho da imagem precisa ser maior que zero");
    }

    if (props.sizeInBytes > MAX_SIZE_IN_BYTES) {
      throw new InvariantViolationError("A imagem deve ter no máximo 5 MB");
    }

    return new ImageFile(contentType, props.sizeInBytes, fileExtension);
  }

  get mediaType(): string {
    return this.contentType;
  }

  get byteSize(): number {
    return this.sizeInBytes;
  }

  get extension(): string {
    return this.fileExtension;
  }

  /**
   * Caminho do objeto no bucket. O prefixo por conta mantém o armazenamento
   * legível e permite política por conta no futuro; o id evita que dois envios
   * do mesmo arquivo se sobrescrevam.
   */
  buildStorageKey(props: { accountId: string; fileId: string }): string {
    return `accounts/${props.accountId}/images/${props.fileId}.${this.extension}`;
  }
}
