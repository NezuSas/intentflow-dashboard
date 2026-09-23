import type { HttpClient } from "@/core/http/HttpClient";

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
  constructor(
    private readonly http: HttpClient
  ) {}

  async getAll(): Promise<ADBVersion[]> {
    const response =
      await this.http.get<
        ApiEnvelope<ADBVersion[]>
      >("/adb-versions/");

    return response.data ?? [];
  }
}
