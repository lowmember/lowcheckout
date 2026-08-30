import type { IdGenerator } from "@/application/shared/ports/id-generator";
import type { UseCase } from "@/application/shared/use-case";
import type { ImageUploadTicketDto } from "@/application/uploads/dtos/image-upload.dto";
import type { FileStorage } from "@/application/uploads/ports/file-storage";
import { ImageFile } from "@/domain/uploads/value-objects/image-file";

export interface CreateImageUploadInput {
  accountId: string;
  contentType: string;
  sizeInBytes: number;
}

export type CreateImageUploadUseCase = UseCase<CreateImageUploadInput, ImageUploadTicketDto>;

/**
 * Autoriza um envio de imagem sem nunca ver o arquivo: valida o que o lojista
 * declara, escolhe o caminho no bucket e devolve a URL assinada mais a URL
 * pública definitiva. Guardar essa URL num produto, oferta ou seção é decisão
 * de quem chamou — este caso de uso não conhece nenhum deles.
 */
export class DefaultCreateImageUploadUseCase implements CreateImageUploadUseCase {
  private readonly fileStorage: FileStorage;
  private readonly idGenerator: IdGenerator;

  constructor(fileStorage: FileStorage, idGenerator: IdGenerator) {
    this.fileStorage = fileStorage;
    this.idGenerator = idGenerator;
  }

  async execute(input: CreateImageUploadInput): Promise<ImageUploadTicketDto> {
    const image = ImageFile.create({
      contentType: input.contentType,
      sizeInBytes: input.sizeInBytes,
    });

    const signedUpload = await this.fileStorage.createSignedUpload({
      key: image.buildStorageKey({
        accountId: input.accountId,
        fileId: this.idGenerator.generate(),
      }),
      contentType: image.mediaType,
      contentLength: image.byteSize,
    });

    return {
      uploadUrl: signedUpload.uploadUrl,
      uploadHeaders: signedUpload.uploadHeaders,
      fileUrl: signedUpload.fileUrl,
      expiresInSeconds: signedUpload.expiresInSeconds,
    };
  }
}
