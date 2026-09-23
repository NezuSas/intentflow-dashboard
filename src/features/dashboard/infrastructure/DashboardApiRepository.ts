import type { HttpClient } from "@/core/http/HttpClient";

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
  constructor(
    private readonly http: HttpClient
  ) {}

  async getStats():
    Promise<DashboardStats> {
    const response =
      await this.http.get<
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
