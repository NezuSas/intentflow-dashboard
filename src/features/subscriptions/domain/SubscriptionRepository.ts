import type {
  SubscriptionPlan,
  ClientSubscription,
  SubscriptionPlanPayload,
  ClientSubscriptionPayload,
} from "./Subscription";

export interface SubscriptionRepository {
  getPlans(): Promise<SubscriptionPlan[]>;

  getClientSubscriptions():
    Promise<ClientSubscription[]>;

  createPlan(
    data: SubscriptionPlanPayload
  ): Promise<void>;

  updatePlan(
    id: number,
    data: SubscriptionPlanPayload
  ): Promise<void>;

  deletePlan(id: number): Promise<void>;

  createClientSubscription(
    data: ClientSubscriptionPayload
  ): Promise<void>;

  updateClientSubscription(
    id: number,
    data: ClientSubscriptionPayload
  ): Promise<void>;

  deleteClientSubscription(
    id: number
  ): Promise<void>;
}
