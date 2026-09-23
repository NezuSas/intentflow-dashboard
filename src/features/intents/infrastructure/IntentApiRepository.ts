import type { HttpClient } from "@/core/http/HttpClient";

import type {
  Intent,
} from "../domain/Intent";

import type {
  IntentRepository,
  IntentListQuery,
} from "../domain/IntentRepository";

import type {
  PaginatedResponse,
} from "@/core/Pagination";

interface ApiPageMeta {
  count: number;
  page: number;
  page_size: number;
  next: string | null;
  previous: string | null;
}

interface ApiEnvelope<T> {
  data?: T;
  meta: ApiPageMeta;
  detail?: string;
}

export class IntentApiRepository
  implements IntentRepository
{
  constructor(
    private readonly http: HttpClient
  ) {}

  async list(
    query: IntentListQuery = {}
  ): Promise<PaginatedResponse<Intent>> {
    const params = new URLSearchParams();

    if (query.page !== undefined) {
      params.set("page", String(query.page));
    }

    if (query.pageSize !== undefined) {
      params.set("page_size", String(query.pageSize));
    }

    if (query.search) {
      params.set("search", query.search);
    }

    if (query.ordering) {
      params.set("ordering", query.ordering);
    }

    if (query.client !== undefined) {
      params.set("client", String(query.client));
    }

    if (query.board !== undefined) {
      params.set("board", String(query.board));
    }

    if (query.status) {
      params.set("status", query.status);
    }

    if (query.executedAtAfter) {
      params.set(
        "executed_at_after",
        query.executedAtAfter
      );
    }

    if (query.executedAtBefore) {
      params.set(
        "executed_at_before",
        query.executedAtBefore
      );
    }

    const queryString = params.toString();
    const path = queryString
      ? `/intents/?${queryString}`
      : "/intents/";

    const response =
      await this.http.get<
        ApiEnvelope<Intent[]>
      >(path);

    return {
      data: response.data ?? [],
      meta: {
        count: response.meta.count,
        page: response.meta.page,
        pageSize: response.meta.page_size,
        next: response.meta.next,
        previous: response.meta.previous,
      },
    };
  }
}
