import {
  Board,
  BoardPayload,
} from "./Board";

export interface BoardRepository {
  getAll(): Promise<Board[]>;

  create(
    data: BoardPayload
  ): Promise<void>;

  update(
    id: number,
    data: BoardPayload
  ): Promise<void>;

  delete(id: number): Promise<void>;
}
