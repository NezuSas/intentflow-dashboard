import type {
  Client,
  ClientPayload,
} from "../domain/Client";

import type {
  ClientRepository,
} from "../domain/ClientRepository";

export class ClientService {
  constructor(
    private readonly repository:
      ClientRepository
  ) {}

  getClients(): Promise<Client[]> {
    return this.repository.getAll();
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
