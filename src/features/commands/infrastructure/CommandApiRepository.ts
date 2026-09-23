import type { HttpClient } from "@/core/http/HttpClient";

import type {
  ADBCommand,
  CommandPayload,
} from "../domain/Command";

import type {
  CommandRepository,
} from "../domain/CommandRepository";
import { buildListPath, mapPaginatedResponse } from "@/core/Pagination";
import type { ListQuery, PaginatedResponse, ApiPaginatedEnvelope } from "@/core/Pagination";

interface ApiEnvelope<T> {
  data?: T;
  detail?: string;
}

export class CommandApiRepository
  implements CommandRepository
{
  constructor(
    private readonly http: HttpClient
  ) {}

  async list(query: ListQuery = {}): Promise<PaginatedResponse<ADBCommand>> {
    const response = await this.http.get<ApiPaginatedEnvelope<ADBCommand>>(
      buildListPath("/adb-commands/", query)
    );
    return mapPaginatedResponse(response);
  }

  async create(
    data: CommandPayload
  ): Promise<void> {
    await this.http.post(
      "/adb-commands/",
      data
    );
  }

  async update(
    id: number,
    data: CommandPayload
  ): Promise<void> {
    await this.http.patch(
      `/adb-commands/${id}/`,
      data
    );
  }

  async delete(id: number): Promise<void> {
    await this.http.delete(
      `/adb-commands/${id}/`
    );
  }
}
