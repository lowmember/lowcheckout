import { Agent, request as httpsRequest } from "node:https";

import { GatewayUnavailableError } from "@/domain/gateways/errors/gateway-unavailable.error";

export interface EfiBankHttpResponse {
  statusCode: number;
  body: unknown;
}

export interface EfiBankHttpRequest {
  baseUrl: string;
  method: "GET" | "POST" | "PUT";
  path: string;
  headers: Record<string, string>;
  body?: unknown;
  /** Material mTLS: `.p12` do EfiBank já decodificado. */
  pfx: Buffer | null;
  passphrase: string | null;
  timeoutMs: number;
}

/**
 * O EfiBank exige **mTLS**: o certificado `.p12` da conta é apresentado no
 * handshake. O `fetch` global do Node não expõe um jeito estável de anexar
 * certificado de cliente, então aqui usamos `node:https`, que aceita `pfx`
 * direto no `Agent`.
 */
export async function sendEfiBankRequest(input: EfiBankHttpRequest): Promise<EfiBankHttpResponse> {
  const url = new URL(input.path, input.baseUrl);
  const payload = input.body === undefined ? undefined : JSON.stringify(input.body);

  const agent = new Agent({
    ...(input.pfx ? { pfx: input.pfx } : {}),
    ...(input.passphrase ? { passphrase: input.passphrase } : {}),
    keepAlive: false,
  });

  try {
    return await new Promise<EfiBankHttpResponse>((resolve, reject) => {
      const req = httpsRequest(
        {
          agent,
          method: input.method,
          host: url.hostname,
          port: url.port === "" ? 443 : Number(url.port),
          path: `${url.pathname}${url.search}`,
          headers: {
            Accept: "application/json",
            ...(payload === undefined
              ? {}
              : {
                  "Content-Type": "application/json",
                  "Content-Length": Buffer.byteLength(payload),
                }),
            ...input.headers,
          },
          timeout: input.timeoutMs,
        },
        (res) => {
          const chunks: Buffer[] = [];

          res.on("data", (chunk: Buffer) => chunks.push(chunk));
          res.on("end", () => {
            const raw = Buffer.concat(chunks).toString("utf8");

            resolve({
              statusCode: res.statusCode ?? 0,
              body: raw === "" ? null : safeParseJson(raw),
            });
          });
        },
      );

      req.on("timeout", () => {
        req.destroy(new Error("tempo limite excedido"));
      });
      req.on("error", (error) => reject(error));

      if (payload !== undefined) {
        req.write(payload);
      }

      req.end();
    });
  } catch (error) {
    throw new GatewayUnavailableError(error instanceof Error ? error.message : undefined);
  } finally {
    agent.destroy();
  }
}

function safeParseJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return { raw };
  }
}
