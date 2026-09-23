import { apiClient } from "@/core/http/ApiClient";

import type {
  ADBCommand,
  CommandPayload,
} from "../domain/Command";

import type {
  CommandRepository,
} from "../domain/CommandRepository";

interface ApiEnvelope<T> {
  data?: T;
  detail?: string;
}

export class CommandApiRepository
  implements CommandRepository
{
  async getAll(): Promise<ADBCommand[]> {
    const response =
      await apiClient.get<
        ApiEnvelope<ADBCommand[]>
      >("/adb-commands/");

    return response.data ?? [];
  }

  async create(
    data: CommandPayload
  ): Promise<void> {
    await apiClient.post(
      "/adb-commands/",
      data
    );
  }

  async update(
    id: number,
    data: CommandPayload
  ): Promise<void> {
    await apiClient.patch(
      `/adb-commands/${id}/`,
      data
    );
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(
      `/adb-commands/${id}/`
    );
  }
}
