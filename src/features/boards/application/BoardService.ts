import {
  Board,
  BoardPayload,
} from "../domain/Board";

import { BoardRepository } from "../domain/BoardRepository";
import type { ListQuery, PaginatedResponse } from "@/core/Pagination";

export class BoardService {
  constructor(
    private readonly repository:
      BoardRepository
  ) {}

  listBoards(query?: ListQuery): Promise<PaginatedResponse<Board>> {
    return this.repository.list(query);
  }

  async getBoards(): Promise<Board[]> {
    return (await this.listBoards({ page: 1, pageSize: 20 })).data;
  }

  getBoardCatalog(client?: number): Promise<Array<Pick<Board, "id" | "name" | "client">>> {
    return this.repository.getCatalog(client);
  }

  createBoard(
    data: BoardPayload
  ): Promise<void> {
    return this.repository.create(data);
  }

  updateBoard(
    id: number,
    data: BoardPayload
  ): Promise<void> {
    return this.repository.update(
      id,
      data
    );
  }

  deleteBoard(
    id: number
  ): Promise<void> {
    return this.repository.delete(id);
  }
}
