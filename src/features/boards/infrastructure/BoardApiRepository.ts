import type { HttpClient } from "@/core/http/HttpClient";

import {
  Board,
  BoardPayload,
} from "../domain/Board";

import { BoardRepository } from "../domain/BoardRepository";

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

  async getAll(): Promise<Board[]> {
    const response =
      await this.http.get<
        ApiEnvelope<Board[]>
      >("/boards/");

    return response.data ?? [];
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
