import { apiClient } from "@/core/http/ApiClient";

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
  async getAll(): Promise<User[]> {
    const response =
      await apiClient.get<
        ApiEnvelope<User[]>
      >("/auth/users/");

    return response.data ?? [];
  }

  async toggleActive(
    id: number
  ): Promise<void> {
    await apiClient.post(
      `/auth/users/${id}/toggle-active/`
    );
  }

  async changeRole(
    id: number,
    role: string
  ): Promise<void> {
    await apiClient.post(
      `/auth/users/${id}/change-role/`,
      { role }
    );
  }

  async update(
    id: number,
    data: UserUpdatePayload
  ): Promise<void> {
    await apiClient.patch(
      `/auth/users/${id}/`,
      data
    );
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(
      `/auth/users/${id}/`
    );
  }
}
