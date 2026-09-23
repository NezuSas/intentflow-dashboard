import type {
  LoginResponse,
} from "../domain/Auth";

import type {
  AuthRepository,
} from "../domain/AuthRepository";

import type {
  AuthTokenManager,
} from "../domain/AuthTokenManager";

import type {
  AuthSessionEvents,
} from "../domain/AuthSessionEvents";

export class AuthService {
  constructor(
    private readonly repository:
      AuthRepository,
    private readonly tokens:
      AuthTokenManager,
    private readonly events:
      AuthSessionEvents
  ) {}

  async login(
    email: string,
    password: string
  ): Promise<LoginResponse> {
    const response =
      await this.repository.login(
        email,
        password
      );

    this.tokens.setTokens(
      response.access,
      response.refresh
    );

    return response;
  }

  async logout(): Promise<void> {
    const refreshToken =
      this.tokens.getRefreshToken();

    let accessToken =
      this.tokens.getAccessToken();

    try {
      if (
        !accessToken &&
        refreshToken
      ) {
        accessToken =
          await this.tokens
            .refreshAccessToken();
      }

      if (
        refreshToken &&
        accessToken
      ) {
        await this.repository.logout(
          accessToken,
          refreshToken
        );
      }
    } catch {
      // El cierre local continúa.
    } finally {
      this.tokens.clear();
      this.events.notifyLogout();
    }
  }
}
