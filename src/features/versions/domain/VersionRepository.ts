import type {
  ADBVersion,
} from "./ADBVersion";

export interface VersionRepository {
  getAll(): Promise<ADBVersion[]>;
}
