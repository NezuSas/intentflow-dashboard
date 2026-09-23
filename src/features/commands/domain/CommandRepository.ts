import type {
  ADBCommand,
  CommandPayload,
} from "./Command";
import type { ListQuery, PaginatedResponse } from "@/core/Pagination";

export interface CommandRepository {
  list(query?: ListQuery): Promise<PaginatedResponse<ADBCommand>>;

  create(
    data: CommandPayload
  ): Promise<void>;

  update(
    id: number,
    data: CommandPayload
  ): Promise<void>;

  delete(id: number): Promise<void>;
}
