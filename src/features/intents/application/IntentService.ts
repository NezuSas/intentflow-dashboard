import type {
  IntentListQuery,
  IntentRepository,
} from "../domain/IntentRepository";

import type {
  Intent,
} from "../domain/Intent";

import type {
  PaginatedResponse,
} from "@/core/Pagination";

export class IntentService {
  constructor(
    private readonly repository:
      IntentRepository
  ) {}

  list(
    query?: IntentListQuery
  ): Promise<PaginatedResponse<Intent>> {
    return this.repository.list(query);
  }
}
