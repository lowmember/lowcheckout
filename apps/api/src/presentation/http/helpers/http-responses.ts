import type { HttpResponse } from "@/presentation/http/protocols/http";

export function ok<TData>(data: TData): HttpResponse {
  return { statusCode: 200, body: { data } };
}

export function okPage<TData>(page: { data: TData[]; meta: unknown }): HttpResponse {
  return { statusCode: 200, body: page };
}

export function created<TData>(data: TData): HttpResponse {
  return { statusCode: 201, body: { data } };
}

export function noContent(): HttpResponse {
  return { statusCode: 204 };
}

export function failure(
  statusCode: number,
  message: string,
  code: string,
  details?: unknown,
): HttpResponse {
  return {
    statusCode,
    body: { message, code, ...(details ? { details } : {}) },
  };
}
