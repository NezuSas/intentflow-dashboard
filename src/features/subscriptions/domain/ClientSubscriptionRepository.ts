import type {
  ClientSubscription,
  ClientSubscriptionPayload,
} from "./Subscription";
import type { ListQuery, PaginatedResponse } from "@/core/Pagination";

export interface ClientSubscriptionRepository {
  list(query?: ListQuery): Promise<PaginatedResponse<ClientSubscription>>;

  create(
    data: ClientSubscriptionPayload
  ): Promise<void>;

  update(
    id: number,
    data: ClientSubscriptionPayload
  ): Promise<void>;

  delete(id: number): Promise<void>;
}
