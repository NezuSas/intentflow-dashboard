import type { HttpClient } from "@/core/http/HttpClient";

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
  constructor(
    private readonly http: HttpClient
  ) {}

  async getAll(): Promise<Intent[]> {
    const response =
      await this.http.get<
        ApiEnvelope<Intent[]>
      >("/intents/");

    return response.data ?? [];
  }
}
