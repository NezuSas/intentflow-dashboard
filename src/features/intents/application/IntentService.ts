import type {
  Intent,
} from "../domain/Intent";

import type {
  IntentRepository,
} from "../domain/IntentRepository";

export class IntentService {
  constructor(
    private readonly repository:
      IntentRepository
  ) {}

  getIntents(): Promise<Intent[]> {
    return this.repository.getAll();
  }
}
