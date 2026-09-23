import { apiClient } from "@/core/http/ApiClient";

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
  async getAll(): Promise<Board[]> {
    const response =
      await apiClient.get<
        ApiEnvelope<Board[]>
      >("/boards/");

    return response.data ?? [];
  }

  async create(
    data: BoardPayload
  ): Promise<void> {
    await apiClient.post(
      "/boards/",
      data
    );
  }

  async update(
    id: number,
    data: BoardPayload
  ): Promise<void> {
    await apiClient.patch(
      `/boards/${id}/`,
      data
    );
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(
      `/boards/${id}/`
    );
  }
}
