import type {
  SubscriptionPlan,
  ClientSubscription,
  SubscriptionPlanPayload,
  ClientSubscriptionPayload,
} from "../domain/Subscription";

import type {
  SubscriptionPlanRepository,
} from "../domain/SubscriptionPlanRepository";

import type {
  ClientSubscriptionRepository,
} from "../domain/ClientSubscriptionRepository";

export class SubscriptionService {
  constructor(
    private readonly planRepository:
      SubscriptionPlanRepository,
    private readonly clientSubscriptionRepository:
      ClientSubscriptionRepository
  ) {}

  getPlans():
    Promise<SubscriptionPlan[]> {
    return this.planRepository.getAll();
  }

  getClientSubscriptions():
    Promise<ClientSubscription[]> {
    return this.clientSubscriptionRepository
      .getAll();
  }

  createPlan(
    data: SubscriptionPlanPayload
  ): Promise<void> {
    return this.planRepository
      .create(data);
  }

  updatePlan(
    id: number,
    data: SubscriptionPlanPayload
  ): Promise<void> {
    return this.planRepository
      .update(id, data);
  }

  deletePlan(
    id: number
  ): Promise<void> {
    return this.planRepository
      .delete(id);
  }

  createClientSubscription(
    data: ClientSubscriptionPayload
  ): Promise<void> {
    return this.clientSubscriptionRepository
      .create(data);
  }

  updateClientSubscription(
    id: number,
    data: ClientSubscriptionPayload
  ): Promise<void> {
    return this.clientSubscriptionRepository
      .update(id, data);
  }

  deleteClientSubscription(
    id: number
  ): Promise<void> {
    return this.clientSubscriptionRepository
      .delete(id);
  }
}
