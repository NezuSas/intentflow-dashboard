import type {
  DashboardStats,
} from "../domain/DashboardStats";

import type {
  DashboardRepository,
} from "../domain/DashboardRepository";

export class DashboardService {
  constructor(
    private readonly repository:
      DashboardRepository
  ) {}

  getStats():
    Promise<DashboardStats> {
    return this.repository.getStats();
  }
}
