import { httpClient } from "@/composition/http";

import { SubscriptionService } from "./application/SubscriptionService";

import { SubscriptionPlanApiRepository } from "./infrastructure/SubscriptionPlanApiRepository";

import { ClientSubscriptionApiRepository } from "./infrastructure/ClientSubscriptionApiRepository";

const planRepository =
  new SubscriptionPlanApiRepository(
    httpClient
  );

const clientSubscriptionRepository =
  new ClientSubscriptionApiRepository(
    httpClient
  );

export const subscriptionService =
  new SubscriptionService(
    planRepository,
    clientSubscriptionRepository
  );

export type {
  SubscriptionPlan,
  ClientSubscription,
  SubscriptionPlanPayload,
  ClientSubscriptionPayload,
} from "./domain/Subscription";

export type {
  SubscriptionPlanRepository,
} from "./domain/SubscriptionPlanRepository";

export type {
  ClientSubscriptionRepository,
} from "./domain/ClientSubscriptionRepository";

export {
  SubscriptionService,
  SubscriptionPlanApiRepository,
  ClientSubscriptionApiRepository,
};
