import type {
  Client,
  ClientPayload,
} from "./Client";

export interface ClientRepository {
  getAll(): Promise<Client[]>;

  create(
    data: ClientPayload
  ): Promise<void>;

  update(
    id: number,
    data: ClientPayload
  ): Promise<void>;

  delete(id: number): Promise<void>;
}
