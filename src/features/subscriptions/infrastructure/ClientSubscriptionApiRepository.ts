import type {
  HttpClient,
} from "@/core/http/HttpClient";

import type {
  ClientSubscription,
  ClientSubscriptionPayload,
} from "../domain/Subscription";

import type {
  ClientSubscriptionRepository,
} from "../domain/ClientSubscriptionRepository";
import { buildListPath, mapPaginatedResponse } from "@/core/Pagination";
import type { ListQuery, PaginatedResponse, ApiPaginatedEnvelope } from "@/core/Pagination";

export class ClientSubscriptionApiRepository
  implements ClientSubscriptionRepository
{
  constructor(
    private readonly http: HttpClient
  ) {}

  async list(query: ListQuery = {}): Promise<PaginatedResponse<ClientSubscription>> {
    const response = await this.http.get<ApiPaginatedEnvelope<ClientSubscription>>(
      buildListPath("/client-subscriptions/", query)
    );
    return mapPaginatedResponse(response);
  }

  async create(
    data: ClientSubscriptionPayload
  ): Promise<void> {
    await this.http.post(
      "/client-subscriptions/",
      data
    );
  }

  async update(
    id: number,
    data: ClientSubscriptionPayload
  ): Promise<void> {
    await this.http.patch(
      `/client-subscriptions/${id}/`,
      data
    );
  }

  async delete(
    id: number
  ): Promise<void> {
    await this.http.delete(
      `/client-subscriptions/${id}/`
    );
  }
}
