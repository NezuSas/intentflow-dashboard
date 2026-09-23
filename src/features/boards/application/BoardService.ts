import {
  Board,
  BoardPayload,
} from "../domain/Board";

import { BoardRepository } from "../domain/BoardRepository";

export class BoardService {
  constructor(
    private readonly repository:
      BoardRepository
  ) {}

  getBoards(): Promise<Board[]> {
    return this.repository.getAll();
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
