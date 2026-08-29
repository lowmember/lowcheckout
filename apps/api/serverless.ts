import { lambdaFunctions } from "@/infra/http/lambda/lambda-functions";
import { scheduledLambdaFunctions } from "@/infra/scheduler/lambda/scheduled-functions";

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
    },
    httpApi: {
      cors: {
        allowedOrigins: ["http://localhost:5173"],
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
};

export default serverlessConfiguration;
