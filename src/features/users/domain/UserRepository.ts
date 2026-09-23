import type {
  User,
  UserUpdatePayload,
  UserCreatePayload,
} from "./User";
import type { ListQuery, PaginatedResponse } from "@/core/Pagination";

export interface UserRepository {
  list(query?: ListQuery): Promise<PaginatedResponse<User>>;
  getCurrent(): Promise<User>;
  create(data: UserCreatePayload): Promise<void>;

  toggleActive(id: number): Promise<void>;

  changeRole(
    id: number,
    role: string
  ): Promise<void>;

  update(
    id: number,
    data: UserUpdatePayload
  ): Promise<void>;

  delete(id: number): Promise<void>;
}
