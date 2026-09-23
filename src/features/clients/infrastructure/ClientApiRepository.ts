import type { HttpClient } from "@/core/http/HttpClient";

import type {
  Client,
  ClientPayload,
} from "../domain/Client";

import type {
  ClientRepository,
} from "../domain/ClientRepository";

interface ApiEnvelope<T> {
  data?: T;
  detail?: string;
}

export class ClientApiRepository
  implements ClientRepository
{
  constructor(
    private readonly http: HttpClient
  ) {}

  async getAll(): Promise<Client[]> {
    const response =
      await this.http.get<
        ApiEnvelope<Client[]>
      >("/clients/");

    return response.data ?? [];
  }

  async create(
    data: ClientPayload
  ): Promise<void> {
    await this.http.post(
      "/clients/",
      data
    );
  }

  async update(
    id: number,
    data: ClientPayload
  ): Promise<void> {
    await this.http.patch(
      `/clients/${id}/`,
      data
    );
  }

  async delete(id: number): Promise<void> {
    await this.http.delete(
      `/clients/${id}/`
    );
  }
}
