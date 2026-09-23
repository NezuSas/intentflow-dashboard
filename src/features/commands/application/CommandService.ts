import type {
  ADBCommand,
  CommandPayload,
} from "../domain/Command";

import type {
  CommandRepository,
} from "../domain/CommandRepository";
import type { ListQuery, PaginatedResponse } from "@/core/Pagination";

export class CommandService {
  constructor(
    private readonly repository:
      CommandRepository
  ) {}

  listCommands(query?: ListQuery): Promise<PaginatedResponse<ADBCommand>> {
    return this.repository.list(query);
  }

  async getCommands(): Promise<ADBCommand[]> {
    return (await this.listCommands({ page: 1, pageSize: 20 })).data;
  }

  createCommand(
    data: CommandPayload
  ): Promise<void> {
    return this.repository.create(data);
  }

  updateCommand(
    id: number,
    data: CommandPayload
  ): Promise<void> {
    return this.repository.update(
      id,
      data
    );
  }

  deleteCommand(
    id: number
  ): Promise<void> {
    return this.repository.delete(id);
  }
}
