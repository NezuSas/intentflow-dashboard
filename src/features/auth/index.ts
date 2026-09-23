import { AuthService } from "./application/AuthService";
import { JwtAuthTokenManager } from "./application/JwtAuthTokenManager";

import { AuthApiRepository } from "./infrastructure/AuthApiRepository";
import { BrowserAuthSessionStorage } from "./infrastructure/BrowserAuthSessionStorage";
import { BrowserAuthSessionEvents } from "./infrastructure/BrowserAuthSessionEvents";
import { AuthenticatedFetcher } from "./infrastructure/AuthenticatedFetcher";

const authRepository =
  new AuthApiRepository();

const authStorage =
  new BrowserAuthSessionStorage();

const authEvents =
  new BrowserAuthSessionEvents();

export const authTokenManager =
  new JwtAuthTokenManager(
    authRepository,
    authStorage
  );

export const authService =
  new AuthService(
    authRepository,
    authTokenManager,
    authEvents
  );

export const authenticatedFetcher =
  new AuthenticatedFetcher(
    authTokenManager,
    authEvents,
    (url, options) =>
      fetch(url, options)
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

export type {
  AuthTokenManager,
} from "./domain/AuthTokenManager";

export type {
  AuthSessionEvents,
} from "./domain/AuthSessionEvents";

export {
  AuthService,
  JwtAuthTokenManager,
  AuthApiRepository,
  BrowserAuthSessionStorage,
  BrowserAuthSessionEvents,
  AuthenticatedFetcher,
};
