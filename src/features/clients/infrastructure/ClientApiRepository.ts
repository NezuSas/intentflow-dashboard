import type { HttpClient } from "@/core/http/HttpClient";

import type {
  Client,
  ClientPayload,
} from "../domain/Client";

import type {
  ClientRepository,
} from "../domain/ClientRepository";
import { buildListPath, mapPaginatedResponse } from "@/core/Pagination";
import type { ListQuery, PaginatedResponse, ApiPaginatedEnvelope } from "@/core/Pagination";

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

  async list(query: ListQuery = {}): Promise<PaginatedResponse<Client>> {
    const response = await this.http.get<ApiPaginatedEnvelope<Client>>(
      buildListPath("/clients/", query)
    );
    return mapPaginatedResponse(response);
  }

  async getCatalog(): Promise<Array<Pick<Client, "id" | "name">>> {
    const response = await this.http.get<ApiEnvelope<Array<Pick<Client, "id" | "name">>>>("/clients/catalog/");
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
