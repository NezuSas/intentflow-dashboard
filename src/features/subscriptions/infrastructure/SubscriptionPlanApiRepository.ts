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
import { buildListPath, mapPaginatedResponse } from "@/core/Pagination";
import type { ListQuery, PaginatedResponse, ApiPaginatedEnvelope } from "@/core/Pagination";

interface ApiEnvelope<T> {
  data?: T;
}

export class SubscriptionPlanApiRepository
  implements SubscriptionPlanRepository
{
  constructor(
    private readonly http: HttpClient
  ) {}

  async list(query: ListQuery = {}): Promise<PaginatedResponse<SubscriptionPlan>> {
    const response = await this.http.get<ApiPaginatedEnvelope<SubscriptionPlan>>(
      buildListPath("/subscription-plans/", query)
    );
    return mapPaginatedResponse(response);
  }

  async getCatalog(): Promise<Array<Pick<SubscriptionPlan, "id" | "name" | "price" | "plan_type">>> {
    const response = await this.http.get<ApiEnvelope<Array<Pick<SubscriptionPlan, "id" | "name" | "price" | "plan_type">>>>("/subscription-plans/catalog/");
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
