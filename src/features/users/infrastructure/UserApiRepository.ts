import type { HttpClient } from "@/core/http/HttpClient";

import type {
  User,
  UserUpdatePayload,
} from "../domain/User";

import type {
  UserRepository,
} from "../domain/UserRepository";
import { buildListPath, mapPaginatedResponse } from "@/core/Pagination";
import type { ListQuery, PaginatedResponse, ApiPaginatedEnvelope } from "@/core/Pagination";

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

  async list(query: ListQuery = {}): Promise<PaginatedResponse<User>> {
    const response = await this.http.get<ApiPaginatedEnvelope<User>>(
      buildListPath("/auth/users/", query)
    );
    return mapPaginatedResponse(response);
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
