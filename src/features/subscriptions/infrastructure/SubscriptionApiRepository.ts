import type { HttpClient } from "@/core/http/HttpClient";

import type {
  SubscriptionPlan,
  ClientSubscription,
  SubscriptionPlanPayload,
  ClientSubscriptionPayload,
} from "../domain/Subscription";

import type {
  SubscriptionRepository,
} from "../domain/SubscriptionRepository";

interface ApiEnvelope<T> {
  data?: T;
  detail?: string;
}

export class SubscriptionApiRepository
  implements SubscriptionRepository
{
  constructor(
    private readonly http: HttpClient
  ) {}

  async getPlans():
    Promise<SubscriptionPlan[]> {
    const response =
      await this.http.get<
        ApiEnvelope<SubscriptionPlan[]>
      >("/subscription-plans/");

    return response.data ?? [];
  }

  async getClientSubscriptions():
    Promise<ClientSubscription[]> {
    const response =
      await this.http.get<
        ApiEnvelope<ClientSubscription[]>
      >("/client-subscriptions/");

    return response.data ?? [];
  }

  async createPlan(
    data: SubscriptionPlanPayload
  ): Promise<void> {
    await this.http.post(
      "/subscription-plans/",
      data
    );
  }

  async updatePlan(
    id: number,
    data: SubscriptionPlanPayload
  ): Promise<void> {
    await this.http.patch(
      `/subscription-plans/${id}/`,
      data
    );
  }

  async deletePlan(
    id: number
  ): Promise<void> {
    await this.http.delete(
      `/subscription-plans/${id}/`
    );
  }

  async createClientSubscription(
    data: ClientSubscriptionPayload
  ): Promise<void> {
    await this.http.post(
      "/client-subscriptions/",
      data
    );
  }

  async updateClientSubscription(
    id: number,
    data: ClientSubscriptionPayload
  ): Promise<void> {
    await this.http.patch(
      `/client-subscriptions/${id}/`,
      data
    );
  }

  async deleteClientSubscription(
    id: number
  ): Promise<void> {
    await this.http.delete(
      `/client-subscriptions/${id}/`
    );
  }
}
