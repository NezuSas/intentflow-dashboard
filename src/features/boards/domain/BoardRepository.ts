import {
  Board,
  BoardPayload,
} from "./Board";
import type { ListQuery, PaginatedResponse } from "@/core/Pagination";

export interface BoardRepository {
  list(query?: ListQuery): Promise<PaginatedResponse<Board>>;
  getCatalog(client?: number): Promise<Array<Pick<Board, "id" | "name" | "client">>>;

  create(
    data: BoardPayload
  ): Promise<void>;

  update(
    id: number,
    data: BoardPayload
  ): Promise<void>;

  delete(id: number): Promise<void>;
}
