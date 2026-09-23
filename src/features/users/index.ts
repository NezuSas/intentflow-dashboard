import { UserService } from "./application/UserService";
import { UserApiRepository } from "./infrastructure/UserApiRepository";

const userRepository =
  new UserApiRepository();

export const userService =
  new UserService(userRepository);

export type {
  User,
  UserUpdatePayload,
} from "./domain/User";

export type {
  UserRepository,
} from "./domain/UserRepository";

export {
  UserService,
  UserApiRepository,
};
