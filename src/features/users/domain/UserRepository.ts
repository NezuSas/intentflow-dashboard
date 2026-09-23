import type {
  User,
  UserUpdatePayload,
} from "./User";

export interface UserRepository {
  getAll(): Promise<User[]>;

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
