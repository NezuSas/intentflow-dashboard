import { apiClient } from "@/core/http/ApiClient";

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
  async getAll(): Promise<Client[]> {
    const response =
      await apiClient.get<
        ApiEnvelope<Client[]>
      >("/clients/");

    return response.data ?? [];
  }

  async create(
    data: ClientPayload
  ): Promise<void> {
    await apiClient.post(
      "/clients/",
      data
    );
  }

  async update(
    id: number,
    data: ClientPayload
  ): Promise<void> {
    await apiClient.patch(
      `/clients/${id}/`,
      data
    );
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(
      `/clients/${id}/`
    );
  }
}
