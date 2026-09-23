import type { HttpClient } from "@/core/http/HttpClient";

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
  constructor(
    private readonly http: HttpClient
  ) {}

  async getAll(): Promise<ADBCommand[]> {
    const response =
      await this.http.get<
        ApiEnvelope<ADBCommand[]>
      >("/adb-commands/");

    return response.data ?? [];
  }

  async create(
    data: CommandPayload
  ): Promise<void> {
    await this.http.post(
      "/adb-commands/",
      data
    );
  }

  async update(
    id: number,
    data: CommandPayload
  ): Promise<void> {
    await this.http.patch(
      `/adb-commands/${id}/`,
      data
    );
  }

  async delete(id: number): Promise<void> {
    await this.http.delete(
      `/adb-commands/${id}/`
    );
  }
}
