import { apiClient } from "@/core/http/ApiClient";

import type {
  DashboardStats,
} from "../domain/DashboardStats";

import type {
  DashboardRepository,
} from "../domain/DashboardRepository";

interface ApiEnvelope<T> {
  data?: T;
}

export class DashboardApiRepository
  implements DashboardRepository
{
  async getStats():
    Promise<DashboardStats> {
    const response =
      await apiClient.get<
        ApiEnvelope<DashboardStats> |
        DashboardStats
      >("/intents/stats/");

    if (
      "data" in response &&
      response.data
    ) {
      return response.data;
    }

    return response as DashboardStats;
  }
}
