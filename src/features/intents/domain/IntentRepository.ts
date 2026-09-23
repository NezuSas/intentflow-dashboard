import type {
  Intent,
} from "./Intent";

export interface IntentRepository {
  getAll(): Promise<Intent[]>;
}
