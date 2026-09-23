import type {
  Client,
  ClientPayload,
} from "../domain/Client";

import type {
  ClientRepository,
} from "../domain/ClientRepository";
import type { ListQuery, PaginatedResponse } from "@/core/Pagination";

export class ClientService {
  constructor(
    private readonly repository:
      ClientRepository
  ) {}

  listClients(query?: ListQuery): Promise<PaginatedResponse<Client>> {
    return this.repository.list(query);
  }

  async getClients(): Promise<Client[]> {
    return (await this.listClients({ page: 1, pageSize: 20 })).data;
  }

  getClientCatalog(): Promise<Array<Pick<Client, "id" | "name">>> {
    return this.repository.getCatalog();
  }

  createClient(
    data: ClientPayload
  ): Promise<void> {
    return this.repository.create(data);
  }

  updateClient(
    id: number,
    data: ClientPayload
  ): Promise<void> {
    return this.repository.update(
      id,
      data
    );
  }

  deleteClient(
    id: number
  ): Promise<void> {
    return this.repository.delete(id);
  }
}
