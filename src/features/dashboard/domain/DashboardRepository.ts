import type {
  DashboardStats,
} from "./DashboardStats";

export interface DashboardRepository {
  getStats(): Promise<DashboardStats>;
}
