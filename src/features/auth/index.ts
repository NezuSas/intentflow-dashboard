import { AuthService } from "./application/AuthService";

import { AuthApiRepository } from "./infrastructure/AuthApiRepository";

import { BrowserAuthSessionStorage } from "./infrastructure/BrowserAuthSessionStorage";

const authRepository =
  new AuthApiRepository();

const authStorage =
  new BrowserAuthSessionStorage();

export const authService =
  new AuthService(
    authRepository,
    authStorage
  );

export type {
  AuthUser,
  LoginResponse,
  RefreshResponse,
} from "./domain/Auth";

export type {
  AuthRepository,
} from "./domain/AuthRepository";

export type {
  AuthSessionStorage,
} from "./domain/AuthSessionStorage";

export {
  AuthService,
  AuthApiRepository,
  BrowserAuthSessionStorage,
};
