import type {
  ClientSubscription,
  ClientSubscriptionPayload,
} from "./Subscription";

export interface ClientSubscriptionRepository {
  getAll(): Promise<ClientSubscription[]>;

  create(
    data: ClientSubscriptionPayload
  ): Promise<void>;

  update(
    id: number,
    data: ClientSubscriptionPayload
  ): Promise<void>;

  delete(id: number): Promise<void>;
}
