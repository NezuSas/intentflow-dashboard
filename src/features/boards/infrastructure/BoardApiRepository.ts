import type { HttpClient } from "@/core/http/HttpClient";

import {
  Board,
  BoardPayload,
} from "../domain/Board";

import { BoardRepository } from "../domain/BoardRepository";
import { buildListPath, mapPaginatedResponse } from "@/core/Pagination";
import type { ListQuery, PaginatedResponse, ApiPaginatedEnvelope } from "@/core/Pagination";

interface ApiEnvelope<T> {
  data?: T;
  detail?: string;
}

export class BoardApiRepository
  implements BoardRepository
{
  constructor(
    private readonly http: HttpClient
  ) {}

  async list(query: ListQuery = {}): Promise<PaginatedResponse<Board>> {
    const response = await this.http.get<ApiPaginatedEnvelope<Board>>(
      buildListPath("/boards/", query)
    );
    return mapPaginatedResponse(response);
  }

  async getCatalog(client?: number): Promise<Array<Pick<Board, "id" | "name" | "client">>> {
    const params = client === undefined ? "" : `?client=${client}`;
    const response = await this.http.get<ApiEnvelope<Array<{
      id: number;
      name: string;
      client_id: number;
    }>>>(`/boards/catalog/${params}`);
    return (response.data ?? []).map((board) => ({
      id: board.id,
      name: board.name,
      client: board.client_id,
    }));
  }

  async create(
    data: BoardPayload
  ): Promise<void> {
    await this.http.post(
      "/boards/",
      data
    );
  }

  async update(
    id: number,
    data: BoardPayload
  ): Promise<void> {
    await this.http.patch(
      `/boards/${id}/`,
      data
    );
  }

  async delete(id: number): Promise<void> {
    await this.http.delete(
      `/boards/${id}/`
    );
  }
}
