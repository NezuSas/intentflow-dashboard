import { httpClient } from "@/composition/http";
import { CommandService } from "./application/CommandService";
import { CommandApiRepository } from "./infrastructure/CommandApiRepository";

const commandRepository =
  new CommandApiRepository(httpClient);

export const commandService =
  new CommandService(commandRepository);

export type {
  ADBCommand,
  CommandPayload,
  CommandPlanDetail,
} from "./domain/Command";

export type {
  CommandRepository,
} from "./domain/CommandRepository";

export {
  CommandService,
  CommandApiRepository,
};
