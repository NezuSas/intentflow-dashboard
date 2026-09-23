import type {
  ADBCommand,
  CommandPayload,
} from "./Command";

export interface CommandRepository {
  getAll(): Promise<ADBCommand[]>;

  create(
    data: CommandPayload
  ): Promise<void>;

  update(
    id: number,
    data: CommandPayload
  ): Promise<void>;

  delete(id: number): Promise<void>;
}
