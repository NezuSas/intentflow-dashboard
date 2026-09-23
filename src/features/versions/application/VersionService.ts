import type {
  ADBVersion,
} from "../domain/ADBVersion";

import type {
  VersionRepository,
} from "../domain/VersionRepository";

export class VersionService {
  constructor(
    private readonly repository:
      VersionRepository
  ) {}

  getVersions(): Promise<ADBVersion[]> {
    return this.repository.getAll();
  }
}
