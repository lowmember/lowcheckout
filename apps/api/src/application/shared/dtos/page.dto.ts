/**
 * Envelope de listagem. É o `PaginatedResponse` do contrato — o alias mantém a
 * convenção de papel da API sem duplicar a forma.
 */

import type { PaginatedResponse } from "@lowcheckout/contracts";

export type PageDto<TItem> = PaginatedResponse<TItem>;
