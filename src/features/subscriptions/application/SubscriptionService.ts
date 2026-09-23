import type {
  SubscriptionPlan,
  ClientSubscription,
  SubscriptionPlanPayload,
  ClientSubscriptionPayload,
} from "../domain/Subscription";

import type {
  SubscriptionRepository,
} from "../domain/SubscriptionRepository";

export class SubscriptionService {
  constructor(
    private readonly repository:
      SubscriptionRepository
  ) {}

  getPlans(): Promise<SubscriptionPlan[]> {
    return this.repository.getPlans();
  }

  getClientSubscriptions():
    Promise<ClientSubscription[]> {
    return this.repository
      .getClientSubscriptions();
  }

  createPlan(
    data: SubscriptionPlanPayload
  ): Promise<void> {
    return this.repository.createPlan(data);
  }

  updatePlan(
    id: number,
    data: SubscriptionPlanPayload
  ): Promise<void> {
    return this.repository.updatePlan(
      id,
      data
    );
  }

  deletePlan(
    id: number
  ): Promise<void> {
    return this.repository.deletePlan(id);
  }

  createClientSubscription(
    data: ClientSubscriptionPayload
  ): Promise<void> {
    return this.repository
      .createClientSubscription(data);
  }

  updateClientSubscription(
    id: number,
    data: ClientSubscriptionPayload
  ): Promise<void> {
    return this.repository
      .updateClientSubscription(
        id,
        data
      );
  }

  deleteClientSubscription(
    id: number
  ): Promise<void> {
    return this.repository
      .deleteClientSubscription(id);
  }
}
