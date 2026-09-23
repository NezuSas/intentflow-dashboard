import type {
  AuthRepository,
} from "../domain/AuthRepository";

import type {
  AuthSessionStorage,
} from "../domain/AuthSessionStorage";

import type {
  AuthTokenManager,
} from "../domain/AuthTokenManager";

export class JwtAuthTokenManager
  implements AuthTokenManager
{
  private refreshPromise:
    Promise<string | null> | null = null;

  constructor(
    private readonly repository:
      AuthRepository,
    private readonly storage:
      AuthSessionStorage
  ) {}

  getAccessToken(): string | null {
    return this.storage.getAccessToken();
  }

  getRefreshToken(): string | null {
    return this.storage.getRefreshToken();
  }

  hasSession(): boolean {
    return Boolean(
      this.getAccessToken() ||
      this.getRefreshToken()
    );
  }

  setTokens(
    accessToken: string,
    refreshToken: string
  ): void {
    this.storage.setTokens(
      accessToken,
      refreshToken
    );
  }

  clear(): void {
    this.storage.clear();
  }

  async refreshAccessToken():
    Promise<string | null> {
    const refreshToken =
      this.getRefreshToken();

    if (!refreshToken) {
      return null;
    }

    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise =
      (async () => {
        try {
          const response =
            await this.repository.refresh(
              refreshToken
            );

          this.storage.setAccessToken(
            response.access
          );

          return response.access;
        } catch {
          this.storage.clear();
          return null;
        }
      })();

    try {
      return await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }
}
