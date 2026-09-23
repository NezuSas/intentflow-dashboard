import {
  describe,
  expect,
  it,
} from "vitest";

import {
  SubscriptionService,
} from "@/features/subscriptions/application/SubscriptionService";

import type {
  SubscriptionPlan,
  ClientSubscription,
} from "@/features/subscriptions/domain/Subscription";

import type {
  SubscriptionPlanRepository,
} from "@/features/subscriptions/domain/SubscriptionPlanRepository";

import type {
  ClientSubscriptionRepository,
} from "@/features/subscriptions/domain/ClientSubscriptionRepository";

class FakePlanRepository
  implements SubscriptionPlanRepository
{
  constructor(
    private readonly plans:
      SubscriptionPlan[]
  ) {}

  async list() {
    return {
      data: this.plans,
      meta: { count: this.plans.length, page: 1, pageSize: 20, next: null, previous: null },
    };
  }

  async getCatalog() {
    return this.plans.map(({ id, name, price, plan_type }) => ({ id, name, price, plan_type }));
  }

  async create():
    Promise<void> {}

  async update():
    Promise<void> {}

  async delete():
    Promise<void> {}
}

class FakeClientSubscriptionRepository
  implements ClientSubscriptionRepository
{
  constructor(
    private readonly subscriptions:
      ClientSubscription[]
  ) {}

  async list() {
    return {
      data: this.subscriptions,
      meta: { count: this.subscriptions.length, page: 1, pageSize: 20, next: null, previous: null },
    };
  }

  async create():
    Promise<void> {}

  async update():
    Promise<void> {}

  async delete():
    Promise<void> {}
}

describe(
  "SubscriptionService",
  () => {
    it(
      "uses segregated repositories",
      async () => {
        const plan:
          SubscriptionPlan = {
            id: 1,
            name: "Premium",
            plan_type: "PREMIUM",
            description:
              "Premium",
            price: 25,
            max_boards: 10,
            is_active: true,
          };

        const subscription:
          ClientSubscription = {
            id: 1,
            client_detail: {
              id: 1,
              name: "NEZU",
            },
            subscription_plan_detail: {
              id: 1,
              name: "Premium",
            },
            start_date:
              "2026-01-01",
            end_date: null,
            is_active: true,
            payment_status: "PAID",
          };

        const service =
          new SubscriptionService(
            new FakePlanRepository(
              [plan]
            ),
            new FakeClientSubscriptionRepository(
              [subscription]
            )
          );

        expect(
          await service.getPlans()
        ).toEqual([plan]);

        expect(
          await service
            .getClientSubscriptions()
        ).toEqual(
          [subscription]
        );
      }
    );
  }
);
