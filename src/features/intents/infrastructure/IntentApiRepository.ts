import { apiClient } from "@/core/http/ApiClient";

import type {
  Intent,
} from "../domain/Intent";

import type {
  IntentRepository,
} from "../domain/IntentRepository";

interface ApiEnvelope<T> {
  data?: T;
  detail?: string;
}

export class IntentApiRepository
  implements IntentRepository
{
  async getAll(): Promise<Intent[]> {
    const response =
      await apiClient.get<
        ApiEnvelope<Intent[]>
      >("/intents/");

    return response.data ?? [];
  }
}
