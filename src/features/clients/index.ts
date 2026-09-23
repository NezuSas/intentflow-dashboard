import { ClientService } from "./application/ClientService";
import { ClientApiRepository } from "./infrastructure/ClientApiRepository";

const clientRepository =
  new ClientApiRepository();

export const clientService =
  new ClientService(clientRepository);

export type {
  Client,
  ClientPayload,
} from "./domain/Client";

export type {
  ClientRepository,
} from "./domain/ClientRepository";

export {
  ClientService,
  ClientApiRepository,
};
