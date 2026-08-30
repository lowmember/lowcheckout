export interface SignedUploadRequest {
  /** Caminho do objeto dentro do bucket, já montado pelo domínio. */
  key: string;
  contentType: string;
  /**
   * Vai assinado como `content-length`: o S3 recusa um `PUT` com tamanho
   * diferente, então o teto de 5 MB não depende da boa-fé do navegador.
   */
  contentLength: number;
}

export interface SignedUpload {
  uploadUrl: string;
  uploadHeaders: Record<string, string>;
  /** URL pública e permanente do objeto — a que é gravada no domínio. */
  fileUrl: string;
  expiresInSeconds: number;
}

/**
 * Armazenamento de arquivos públicos. A aplicação só sabe pedir uma permissão
 * de escrita temporária; onde o byte cai (S3, disco, dublê) é problema da infra.
 */
export interface FileStorage {
  createSignedUpload(request: SignedUploadRequest): Promise<SignedUpload>;
}
