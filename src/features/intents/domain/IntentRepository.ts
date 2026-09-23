import type {
  Intent,
} from "./Intent";

import type {
  ListQuery,
  PaginatedResponse,
} from "@/core/Pagination";

export interface IntentListQuery extends ListQuery {
  client?: number;
  board?: number;
  status?: string;
  executedAtAfter?: string;
  executedAtBefore?: string;
}

export interface IntentRepository {
  list(
    query?: IntentListQuery
  ): Promise<PaginatedResponse<Intent>>;
}
