import { SubscriptionService } from "./application/SubscriptionService";
import { SubscriptionApiRepository } from "./infrastructure/SubscriptionApiRepository";

const subscriptionRepository =
  new SubscriptionApiRepository();

export const subscriptionService =
  new SubscriptionService(
    subscriptionRepository
  );

export type {
  SubscriptionPlan,
  ClientSubscription,
  SubscriptionPlanPayload,
  ClientSubscriptionPayload,
} from "./domain/Subscription";

export type {
  SubscriptionRepository,
} from "./domain/SubscriptionRepository";

export {
  SubscriptionService,
  SubscriptionApiRepository,
};
