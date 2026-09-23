import type {
  SubscriptionPlan,
  SubscriptionPlanPayload,
} from "./Subscription";
import type { ListQuery, PaginatedResponse } from "@/core/Pagination";

export interface SubscriptionPlanRepository {
  list(query?: ListQuery): Promise<PaginatedResponse<SubscriptionPlan>>;
  getCatalog(): Promise<Array<Pick<SubscriptionPlan, "id" | "name" | "price" | "plan_type">>>;

  create(
    data: SubscriptionPlanPayload
  ): Promise<void>;

  update(
    id: number,
    data: SubscriptionPlanPayload
  ): Promise<void>;

  delete(id: number): Promise<void>;
}
