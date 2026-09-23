import { httpClient } from "@/composition/http";
import { VersionService } from "./application/VersionService";
import { VersionApiRepository } from "./infrastructure/VersionApiRepository";

const versionRepository =
  new VersionApiRepository(httpClient);

export const versionService =
  new VersionService(versionRepository);

export type {
  ADBVersion,
} from "./domain/ADBVersion";

export type {
  VersionRepository,
} from "./domain/VersionRepository";

export {
  VersionService,
  VersionApiRepository,
};
