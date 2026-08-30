import { z } from "zod";

/** Variável textual opcional em que "não configurado" chega como string vazia. */
const optionalText = z
  .string()
  .optional()
  .transform((value) => {
    const trimmed = value?.trim();

    return trimmed === undefined || trimmed === "" ? undefined : trimmed;
  });

/**
 * Único ponto do projeto que lê `process.env`. Falha no boot em vez de
 * espalhar `undefined` silencioso pelas camadas de cima.
 */
const envSchema = z.object({
  STAGE: z.string().default("dev"),
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
  DATABASE_POOL_MAX: z.coerce.number().int().positive().max(50).default(1),
  IS_OFFLINE: z.stringbool().default(false),
  LOG_LEVEL: z.enum(["debug", "info", "error"]).default("info"),

  /** Segredo HMAC do access token da API. Obrigatório: sem ele não há sessão confiável. */
  JWT_SECRET: z.string().min(32, "JWT_SECRET precisa de pelo menos 32 caracteres"),
  JWT_ISSUER: z.string().default("lowcheckout-api"),
  JWT_AUDIENCE: z.string().default("lowcheckout-web"),
  ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().int().positive().default(900),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(30),

  /**
   * `aud` esperado no id token do Google. Opcional para não derrubar o boot das
   * demais funções em ambientes onde o OAuth ainda não foi configurado — a rota
   * de login falha explicitamente quando está vazio. String vazia conta como
   * ausente: é o que `.env` e o `${env:...}` do Serverless produzem.
   */
  GOOGLE_CLIENT_ID: optionalText,

  /**
   * Chave AES-256 (32 bytes) das credenciais de terceiros gravadas no banco.
   * Obrigatória: gravar credencial de gateway em claro não é opção.
   */
  ENCRYPTION_KEY: z.string().min(32, "ENCRYPTION_KEY precisa ter 32 bytes (64 caracteres hex)"),

  /**
   * Qual adapter de `PaymentGateway` o composition root monta. `auto` usa o
   * EfiBank real só em produção e o dublê no resto — é o que permite rodar o
   * fluxo público inteiro em desenvolvimento sem conta no provedor.
   */
  PAYMENT_GATEWAY: z.enum(["auto", "fake", "efibank"]).default("auto"),

  /**
   * Prazo do PIX. É configuração do produto, não do usuário (S15): o comprador
   * e o lojista veem o mesmo prazo em todo checkout.
   */
  PIX_EXPIRATION_SECONDS: z.coerce.number().int().positive().max(86_400).default(3600),

  /**
   * Segredo compartilhado do webhook do gateway. Em produção a exigência é
   * incondicional: sem ele, nenhum webhook é aceito.
   */
  WEBHOOK_SECRET: optionalText,

  /** O Lambda já injeta; local vale para assinar URLs contra a região certa. */
  AWS_REGION: z.string().default("us-east-1"),

  /**
   * Bucket das imagens enviadas pelo painel. Opcional de propósito: sem ele o
   * envio responde 503 e o painel segue aceitando URL colada — nenhum ambiente
   * deixa de subir só porque não tem bucket.
   */
  S3_UPLOADS_BUCKET: optionalText,

  /** CDN ou domínio próprio na frente do bucket. Vazio usa o endpoint do S3. */
  S3_UPLOADS_PUBLIC_BASE_URL: optionalText,
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(`Invalid environment:\n${z.prettifyError(parsed.error)}`);
}

export const env = {
  stage: parsed.data.STAGE,
  databaseUrl: parsed.data.DATABASE_URL,
  databasePoolMax: parsed.data.DATABASE_POOL_MAX,
  isOffline: parsed.data.IS_OFFLINE,
  logLevel: parsed.data.LOG_LEVEL,
  jwtSecret: parsed.data.JWT_SECRET,
  jwtIssuer: parsed.data.JWT_ISSUER,
  jwtAudience: parsed.data.JWT_AUDIENCE,
  accessTokenTtlSeconds: parsed.data.ACCESS_TOKEN_TTL_SECONDS,
  refreshTokenTtlDays: parsed.data.REFRESH_TOKEN_TTL_DAYS,
  googleClientId: parsed.data.GOOGLE_CLIENT_ID,
  encryptionKey: parsed.data.ENCRYPTION_KEY,
  paymentGateway: parsed.data.PAYMENT_GATEWAY,
  pixExpirationSeconds: parsed.data.PIX_EXPIRATION_SECONDS,
  webhookSecret: parsed.data.WEBHOOK_SECRET,
  awsRegion: parsed.data.AWS_REGION,
  s3UploadsBucket: parsed.data.S3_UPLOADS_BUCKET,
  s3UploadsPublicBaseUrl: parsed.data.S3_UPLOADS_PUBLIC_BASE_URL,
} as const;
