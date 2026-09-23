import { apiClient } from "@/core/http/ApiClient";

import type {
  ADBVersion,
} from "../domain/ADBVersion";

import type {
  VersionRepository,
} from "../domain/VersionRepository";

interface ApiEnvelope<T> {
  data?: T;
}

export class VersionApiRepository
  implements VersionRepository
{
  async getAll(): Promise<ADBVersion[]> {
    const response =
      await apiClient.get<
        ApiEnvelope<ADBVersion[]>
      >("/adb-versions/");

    return response.data ?? [];
  }
}
