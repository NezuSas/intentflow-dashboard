import type {
  User,
  UserUpdatePayload,
} from "../domain/User";

import type {
  UserRepository,
} from "../domain/UserRepository";

export class UserService {
  constructor(
    private readonly repository:
      UserRepository
  ) {}

  getUsers(): Promise<User[]> {
    return this.repository.getAll();
  }

  toggleActive(
    id: number
  ): Promise<void> {
    return this.repository.toggleActive(id);
  }

  changeRole(
    id: number,
    role: string
  ): Promise<void> {
    return this.repository.changeRole(
      id,
      role
    );
  }

  updateUser(
    id: number,
    data: UserUpdatePayload
  ): Promise<void> {
    return this.repository.update(
      id,
      data
    );
  }

  deleteUser(
    id: number
  ): Promise<void> {
    return this.repository.delete(id);
  }
}
