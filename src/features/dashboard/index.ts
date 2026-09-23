import { DashboardService } from "./application/DashboardService";
import { DashboardApiRepository } from "./infrastructure/DashboardApiRepository";

const dashboardRepository =
  new DashboardApiRepository();

export const dashboardService =
  new DashboardService(
    dashboardRepository
  );

export type {
  DashboardStats,
} from "./domain/DashboardStats";

export type {
  DashboardRepository,
} from "./domain/DashboardRepository";

export {
  DashboardService,
  DashboardApiRepository,
};
