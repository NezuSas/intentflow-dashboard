import { httpClient } from "@/composition/http";
import { IntentService } from "./application/IntentService";
import { IntentApiRepository } from "./infrastructure/IntentApiRepository";

const intentRepository =
  new IntentApiRepository(httpClient);

export const intentService =
  new IntentService(intentRepository);

export type {
  Intent,
  IntentBoard,
  IntentUser,
  IntentClientDetail,
} from "./domain/Intent";

export type {
  IntentRepository,
} from "./domain/IntentRepository";

export {
  IntentService,
  IntentApiRepository,
};
