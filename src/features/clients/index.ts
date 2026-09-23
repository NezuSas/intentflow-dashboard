import { httpClient } from "@/composition/http";
import { ClientService } from "./application/ClientService";
import { ClientApiRepository } from "./infrastructure/ClientApiRepository";

const clientRepository =
  new ClientApiRepository(httpClient);

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
