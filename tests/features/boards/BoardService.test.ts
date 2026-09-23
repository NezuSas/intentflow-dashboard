import {
  describe,
  expect,
  it,
} from "vitest";

import {
  BoardService,
} from "@/features/boards/application/BoardService";

import type {
  Board,
  BoardPayload,
} from "@/features/boards/domain/Board";

import type {
  BoardRepository,
} from "@/features/boards/domain/BoardRepository";

class FakeBoardRepository
  implements BoardRepository
{
  created: BoardPayload[] = [];
  deleted: number[] = [];

  constructor(
    private readonly boards:
      Board[]
  ) {}

  async getAll():
    Promise<Board[]> {
    return this.boards;
  }

  async create(
    data: BoardPayload
  ): Promise<void> {
    this.created.push(data);
  }

  async update():
    Promise<void> {}

  async delete(
    id: number
  ): Promise<void> {
    this.deleted.push(id);
  }
}

describe(
  "BoardService",
  () => {
    it(
      "accepts a substitute repository",
      async () => {
        const board: Board = {
          id: 1,
          name: "Office",
          adb_identifier:
            "192.168.1.10:5555",
          version: 1,
          client: 1,
          is_active: true,
        };

        const repository =
          new FakeBoardRepository(
            [board]
          );

        const service =
          new BoardService(
            repository
          );

        expect(
          await service.getBoards()
        ).toEqual([board]);

        await service.createBoard({
          name: "New Board",
        });

        await service.deleteBoard(1);

        expect(
          repository.created
        ).toEqual([
          {
            name: "New Board",
          },
        ]);

        expect(
          repository.deleted
        ).toEqual([1]);
      }
    );
  }
);
