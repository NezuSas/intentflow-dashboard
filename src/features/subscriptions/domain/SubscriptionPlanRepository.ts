import type {
  SubscriptionPlan,
  SubscriptionPlanPayload,
} from "./Subscription";

export interface SubscriptionPlanRepository {
  getAll(): Promise<SubscriptionPlan[]>;

  create(
    data: SubscriptionPlanPayload
  ): Promise<void>;

  update(
    id: number,
    data: SubscriptionPlanPayload
  ): Promise<void>;

  delete(id: number): Promise<void>;
}
