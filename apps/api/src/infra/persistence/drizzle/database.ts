import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/infra/persistence/drizzle/schema";

export interface DatabaseOptions {
  connectionString: string;
  poolMax: number;
}

/**
 * Neon em produção e Postgres em Docker no desenvolvimento falam o mesmo
 * protocolo, então um único driver TCP atende os dois — o que muda é a URL.
 * `prepare: false` é exigência do pooler (PgBouncer em transaction mode) do Neon.
 */
export function createDatabase({ connectionString, poolMax }: DatabaseOptions) {
  const client = postgres(connectionString, {
    max: poolMax,
    prepare: false,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  return { db: drizzle(client, { schema }), client };
}

export type Database = ReturnType<typeof createDatabase>["db"];
export type DatabaseClient = ReturnType<typeof createDatabase>["client"];
