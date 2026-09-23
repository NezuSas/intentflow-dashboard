import type { HttpClient } from "@/core/http/HttpClient";

import type {
  User,
  UserUpdatePayload,
} from "../domain/User";

import type {
  UserRepository,
} from "../domain/UserRepository";

interface ApiEnvelope<T> {
  data?: T;
  detail?: string;
}

export class UserApiRepository
  implements UserRepository
{
  constructor(
    private readonly http: HttpClient
  ) {}

  async getAll(): Promise<User[]> {
    const response =
      await this.http.get<
        ApiEnvelope<User[]>
      >("/auth/users/");

    return response.data ?? [];
  }

  async toggleActive(
    id: number
  ): Promise<void> {
    await this.http.post(
      `/auth/users/${id}/toggle-active/`
    );
  }

  async changeRole(
    id: number,
    role: string
  ): Promise<void> {
    await this.http.post(
      `/auth/users/${id}/change-role/`,
      { role }
    );
  }

  async update(
    id: number,
    data: UserUpdatePayload
  ): Promise<void> {
    await this.http.patch(
      `/auth/users/${id}/`,
      data
    );
  }

  async delete(id: number): Promise<void> {
    await this.http.delete(
      `/auth/users/${id}/`
    );
  }
}
