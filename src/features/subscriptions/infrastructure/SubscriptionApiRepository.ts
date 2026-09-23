import { apiClient } from "@/core/http/ApiClient";

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
  async getPlans():
    Promise<SubscriptionPlan[]> {
    const response =
      await apiClient.get<
        ApiEnvelope<SubscriptionPlan[]>
      >("/subscription-plans/");

    return response.data ?? [];
  }

  async getClientSubscriptions():
    Promise<ClientSubscription[]> {
    const response =
      await apiClient.get<
        ApiEnvelope<ClientSubscription[]>
      >("/client-subscriptions/");

    return response.data ?? [];
  }

  async createPlan(
    data: SubscriptionPlanPayload
  ): Promise<void> {
    await apiClient.post(
      "/subscription-plans/",
      data
    );
  }

  async updatePlan(
    id: number,
    data: SubscriptionPlanPayload
  ): Promise<void> {
    await apiClient.patch(
      `/subscription-plans/${id}/`,
      data
    );
  }

  async deletePlan(
    id: number
  ): Promise<void> {
    await apiClient.delete(
      `/subscription-plans/${id}/`
    );
  }

  async createClientSubscription(
    data: ClientSubscriptionPayload
  ): Promise<void> {
    await apiClient.post(
      "/client-subscriptions/",
      data
    );
  }

  async updateClientSubscription(
    id: number,
    data: ClientSubscriptionPayload
  ): Promise<void> {
    await apiClient.patch(
      `/client-subscriptions/${id}/`,
      data
    );
  }

  async deleteClientSubscription(
    id: number
  ): Promise<void> {
    await apiClient.delete(
      `/client-subscriptions/${id}/`
    );
  }
}
