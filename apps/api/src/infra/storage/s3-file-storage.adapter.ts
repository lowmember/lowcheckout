import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import type {
  FileStorage,
  SignedUpload,
  SignedUploadRequest,
} from "@/application/uploads/ports/file-storage";

/** Janela curta: a URL é usada pelo navegador logo depois de pedida. */
const EXPIRES_IN_SECONDS = 300;

export interface S3FileStorageOptions {
  bucket: string;
  region: string;
  /** CDN ou domínio próprio na frente do bucket; vazio usa o endpoint do S3. */
  publicBaseUrl?: string;
}

/**
 * Assina um `PUT` direto no bucket. O Lambda nunca toca no arquivo — é o que
 * mantém o upload fora do limite de 6 MB de payload e barato por invocação.
 *
 * `content-type` e `content-length` entram na assinatura: o S3 recusa um envio
 * cujo tipo ou tamanho não sejam exatamente os declarados, então o teto de 5 MB
 * vale mesmo se o navegador for contornado.
 */
export class S3FileStorage implements FileStorage {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicBaseUrl: string;

  constructor(options: S3FileStorageOptions) {
    this.client = new S3Client({
      region: options.region,
      /**
       * Sem isto o SDK anexa `x-amz-checksum-crc32` à URL assinada — calculado
       * sobre o corpo vazio que ele vê aqui — e o S3 recusa o `PUT` real do
       * navegador por divergência de checksum.
       */
      requestChecksumCalculation: "WHEN_REQUIRED",
    });
    this.bucket = options.bucket;
    this.publicBaseUrl =
      options.publicBaseUrl?.replace(/\/+$/, "") ??
      `https://${options.bucket}.s3.${options.region}.amazonaws.com`;
  }

  async createSignedUpload(request: SignedUploadRequest): Promise<SignedUpload> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: request.key,
      ContentType: request.contentType,
      ContentLength: request.contentLength,
    });

    const uploadUrl = await getSignedUrl(this.client, command, {
      expiresIn: EXPIRES_IN_SECONDS,
      signableHeaders: new Set(["content-type", "content-length"]),
    });

    return {
      uploadUrl,
      uploadHeaders: { "Content-Type": request.contentType },
      fileUrl: `${this.publicBaseUrl}/${encodeStorageKey(request.key)}`,
      expiresInSeconds: EXPIRES_IN_SECONDS,
    };
  }
}

/** A chave é montada pelo domínio e só tem segmentos seguros, mas escapar é barato. */
function encodeStorageKey(key: string): string {
  return key.split("/").map(encodeURIComponent).join("/");
}
