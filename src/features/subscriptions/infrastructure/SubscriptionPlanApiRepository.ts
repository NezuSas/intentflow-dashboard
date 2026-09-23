import type {
  HttpClient,
} from "@/core/http/HttpClient";

import type {
  SubscriptionPlan,
  SubscriptionPlanPayload,
} from "../domain/Subscription";

import type {
  SubscriptionPlanRepository,
} from "../domain/SubscriptionPlanRepository";

interface ApiEnvelope<T> {
  data?: T;
}

export class SubscriptionPlanApiRepository
  implements SubscriptionPlanRepository
{
  constructor(
    private readonly http: HttpClient
  ) {}

  async getAll():
    Promise<SubscriptionPlan[]> {
    const response =
      await this.http.get<
        ApiEnvelope<SubscriptionPlan[]>
      >("/subscription-plans/");

    return response.data ?? [];
  }

  async create(
    data: SubscriptionPlanPayload
  ): Promise<void> {
    await this.http.post(
      "/subscription-plans/",
      data
    );
  }

  async update(
    id: number,
    data: SubscriptionPlanPayload
  ): Promise<void> {
    await this.http.patch(
      `/subscription-plans/${id}/`,
      data
    );
  }

  async delete(
    id: number
  ): Promise<void> {
    await this.http.delete(
      `/subscription-plans/${id}/`
    );
  }
}
