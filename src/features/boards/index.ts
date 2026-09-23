import { httpClient } from "@/composition/http";
import { BoardService } from "./application/BoardService";
import { BoardApiRepository } from "./infrastructure/BoardApiRepository";

const boardRepository =
  new BoardApiRepository(httpClient);

export const boardService =
  new BoardService(boardRepository);

export type {
  Board,
  BoardPayload,
  BoardClientDetail,
  BoardVersionDetail,
} from "./domain/Board";

export type {
  BoardRepository,
} from "./domain/BoardRepository";

export {
  BoardService,
  BoardApiRepository,
};
