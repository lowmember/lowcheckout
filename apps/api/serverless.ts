import { existsSync } from "node:fs";

import { lambdaFunctions } from "@/infra/http/lambda/lambda-functions";
import { scheduledLambdaFunctions } from "@/infra/scheduler/lambda/scheduled-functions";

// O Serverless só carrega o `.env` depois de avaliar este arquivo, e as origens
// precisam existir aqui para virar array. `loadEnvFile` é nativo do Node 24.
if (existsSync(".env")) {
  process.loadEnvFile(".env");
}

/**
 * Origens autorizadas pelo API Gateway.
 *
 * Em dev nada disso é exercitado: o proxy do Vite serve a API sob o mesmo
 * origin e não há preflight. Em produção é o contrário — sem a origem do painel
 * aqui, o navegador bloqueia toda chamada com `Authorization`. Por isso a lista
 * é obrigatória e o erro estoura no `deploy`, não em runtime na cara do usuário.
 */
function resolveCorsOrigins(): string[] {
  const origins = (process.env.CORS_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (origins.length === 0) {
    throw new Error(
      "CORS_ORIGINS não definido. Liste as origens separadas por vírgula " +
        '(ex.: "https://app.lowcheckout.com,https://pay.lowcheckout.com"). ' +
        "Em desenvolvimento, `http://localhost:5173` resolve.",
    );
  }

  return origins;
}

/**
 * Nome do bucket das imagens. Global no S3, então é sobrescrevível: se
 * `lowcheckout-api-<stage>-uploads` já existir em outra conta, basta apontar
 * `S3_UPLOADS_BUCKET` para outro nome — o recurso e a variável do Lambda saem
 * daqui, então os dois continuam falando do mesmo bucket.
 */
const UPLOADS_BUCKET_NAME = '${env:S3_UPLOADS_BUCKET, "${self:service}-${sls:stage}-uploads"}';

const serverlessConfiguration = {
  service: "lowcheckout-api",
  frameworkVersion: "4",

  provider: {
    name: "aws",
    runtime: "nodejs24.x",
    architecture: "arm64",
    region: '${env:AWS_REGION, "us-east-1"}',
    stage: '${opt:stage, "dev"}',
    memorySize: 512,
    timeout: 10,
    logRetentionInDays: 14,
    versionFunctions: false,
    environment: {
      NODE_OPTIONS: "--enable-source-maps",
      STAGE: "${sls:stage}",
      DATABASE_URL: "${env:DATABASE_URL}",
      DATABASE_POOL_MAX: '${env:DATABASE_POOL_MAX, "1"}',
      LOG_LEVEL: '${env:LOG_LEVEL, "info"}',
      JWT_SECRET: "${env:JWT_SECRET}",
      JWT_ISSUER: '${env:JWT_ISSUER, "lowcheckout-api"}',
      JWT_AUDIENCE: '${env:JWT_AUDIENCE, "lowcheckout-web"}',
      ACCESS_TOKEN_TTL_SECONDS: '${env:ACCESS_TOKEN_TTL_SECONDS, "900"}',
      REFRESH_TOKEN_TTL_DAYS: '${env:REFRESH_TOKEN_TTL_DAYS, "30"}',
      GOOGLE_CLIENT_ID: '${env:GOOGLE_CLIENT_ID, ""}',
      ENCRYPTION_KEY: "${env:ENCRYPTION_KEY}",
      PAYMENT_GATEWAY: '${env:PAYMENT_GATEWAY, "auto"}',
      PIX_EXPIRATION_SECONDS: '${env:PIX_EXPIRATION_SECONDS, "3600"}',
      WEBHOOK_SECRET: '${env:WEBHOOK_SECRET, ""}',
      // `AWS_REGION` não entra aqui: é reservada e o próprio Lambda a injeta.
      S3_UPLOADS_BUCKET: UPLOADS_BUCKET_NAME,
      S3_UPLOADS_PUBLIC_BASE_URL: '${env:S3_UPLOADS_PUBLIC_BASE_URL, ""}',
    },

    // A API só assina o `PUT`; ela nunca lê nem apaga objeto do bucket.
    iam: {
      role: {
        statements: [
          {
            Effect: "Allow",
            Action: ["s3:PutObject"],
            // `Fn::Join` sobre o próprio recurso: a permissão não pode
            // divergir do bucket que a stack cria.
            Resource: {
              "Fn::Join": ["", ["arn:aws:s3:::", { Ref: "UploadsBucket" }, "/*"]],
            },
          },
        ],
      },
    },
    httpApi: {
      cors: {
        allowedOrigins: resolveCorsOrigins(),
        // `x-account-id`/`x-user-id` são o atalho de identidade fora de produção — TODO(RF-AUTH-03).
        allowedHeaders: ["Content-Type", "Authorization", "x-account-id", "x-user-id"],
        allowedMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      },
    },
  },

  build: {
    esbuild: {
      bundle: true,
      minify: true,
      sourcemap: true,
      target: "node24",
      format: "esm",
    },
  },

  plugins: ["serverless-offline"],

  custom: {
    "serverless-offline": {
      httpPort: 3333,
      noPrependStageInUrl: true,
    },
  },

  // Uma função por rota declarada em `presentation/http/routes/http-routes.ts`,
  // mais as rotinas agendadas de `infra/scheduler/scheduled-jobs.ts`.
  functions: { ...lambdaFunctions, ...scheduledLambdaFunctions },

  resources: {
    Resources: {
      /**
       * Bucket das imagens de produto, oferta e seções do checkout. Leitura
       * pública porque essas URLs são renderizadas na página de checkout, que
       * não tem sessão; escrita, só pela URL assinada que a API emite.
       *
       * `Retain`: derrubar a stack não pode levar junto as imagens dos
       * checkouts publicados — e o CloudFormation falharia ao apagar um bucket
       * com objetos, deixando a stack travada.
       */
      UploadsBucket: {
        Type: "AWS::S3::Bucket",
        DeletionPolicy: "Retain",
        UpdateReplacePolicy: "Retain",
        Properties: {
          BucketName: UPLOADS_BUCKET_NAME,
          // ACL desligada: o acesso público vem da policy abaixo, não do objeto.
          OwnershipControls: { Rules: [{ ObjectOwnership: "BucketOwnerEnforced" }] },
          PublicAccessBlockConfiguration: {
            BlockPublicAcls: true,
            IgnorePublicAcls: true,
            BlockPublicPolicy: false,
            RestrictPublicBuckets: false,
          },
          // O `PUT` sai do navegador, direto do painel: sem isto, o preflight
          // do upload morre antes de o arquivo sair da máquina do lojista.
          CorsConfiguration: {
            CorsRules: [
              {
                AllowedHeaders: ["*"],
                AllowedMethods: ["PUT", "GET", "HEAD"],
                AllowedOrigins: resolveCorsOrigins(),
                MaxAge: 3000,
              },
            ],
          },
        },
      },

      UploadsBucketPolicy: {
        Type: "AWS::S3::BucketPolicy",
        Properties: {
          Bucket: { Ref: "UploadsBucket" },
          PolicyDocument: {
            Version: "2012-10-17",
            Statement: [
              {
                Sid: "PublicReadForCheckoutImages",
                Effect: "Allow",
                Principal: "*",
                Action: "s3:GetObject",
                // `Fn::Join` em vez de `Fn::Sub`: `${...}` numa string deste
                // arquivo seria lido como variável do Serverless.
                Resource: {
                  "Fn::Join": ["", [{ "Fn::GetAtt": ["UploadsBucket", "Arn"] }, "/*"]],
                },
              },
            ],
          },
        },
      },
    },
  },
};

export default serverlessConfiguration;
