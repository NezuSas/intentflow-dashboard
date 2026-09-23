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
import type { ListQuery, PaginatedResponse } from "@/core/Pagination";

export class SubscriptionService {
  constructor(
    private readonly planRepository:
      SubscriptionPlanRepository,
    private readonly clientSubscriptionRepository:
      ClientSubscriptionRepository
  ) {}

  listPlans(query?: ListQuery): Promise<PaginatedResponse<SubscriptionPlan>> {
    return this.planRepository.list(query);
  }

  async getPlans(): Promise<SubscriptionPlan[]> {
    return (await this.listPlans({ page: 1, pageSize: 20 })).data;
  }

  getPlanCatalog(): Promise<Array<Pick<SubscriptionPlan, "id" | "name" | "price" | "plan_type">>> {
    return this.planRepository.getCatalog();
  }

  listClientSubscriptions(query?: ListQuery): Promise<PaginatedResponse<ClientSubscription>> {
    return this.clientSubscriptionRepository.list(query);
  }

  async getClientSubscriptions(): Promise<ClientSubscription[]> {
    return (await this.listClientSubscriptions({ page: 1, pageSize: 20 })).data;
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
