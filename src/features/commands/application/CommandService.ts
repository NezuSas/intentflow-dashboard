import type {
  ADBCommand,
  CommandPayload,
} from "../domain/Command";

import type {
  CommandRepository,
} from "../domain/CommandRepository";

export class CommandService {
  constructor(
    private readonly repository:
      CommandRepository
  ) {}

  getCommands(): Promise<ADBCommand[]> {
    return this.repository.getAll();
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
