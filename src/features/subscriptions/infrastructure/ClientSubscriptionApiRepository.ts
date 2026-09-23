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

interface ApiEnvelope<T> {
  data?: T;
}

export class ClientSubscriptionApiRepository
  implements ClientSubscriptionRepository
{
  constructor(
    private readonly http: HttpClient
  ) {}

  async getAll():
    Promise<ClientSubscription[]> {
    const response =
      await this.http.get<
        ApiEnvelope<ClientSubscription[]>
      >("/client-subscriptions/");

    return response.data ?? [];
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
