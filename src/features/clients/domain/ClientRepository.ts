import type {
  Client,
  ClientPayload,
} from "./Client";
import type { ListQuery, PaginatedResponse } from "@/core/Pagination";

export interface ClientRepository {
  list(query?: ListQuery): Promise<PaginatedResponse<Client>>;
  getCatalog(): Promise<Array<Pick<Client, "id" | "name">>>;

  create(
    data: ClientPayload
  ): Promise<void>;

  update(
    id: number,
    data: ClientPayload
  ): Promise<void>;

  delete(id: number): Promise<void>;
}
