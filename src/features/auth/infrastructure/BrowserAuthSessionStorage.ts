import type {
  AuthSessionStorage,
} from "../domain/AuthSessionStorage";

const isBrowser = () =>
  typeof window !== "undefined";

export class BrowserAuthSessionStorage
  implements AuthSessionStorage
{
  private readonly accessKey =
    "access_token";

  private readonly refreshKey =
    "refresh_token";

  getAccessToken(): string | null {
    if (!isBrowser()) {
      return null;
    }

    return localStorage.getItem(
      this.accessKey
    );
  }

  getRefreshToken(): string | null {
    if (!isBrowser()) {
      return null;
    }

    return localStorage.getItem(
      this.refreshKey
    );
  }

  setTokens(
    accessToken: string,
    refreshToken: string
  ): void {
    if (!isBrowser()) {
      return;
    }

    localStorage.setItem(
      this.accessKey,
      accessToken
    );

    localStorage.setItem(
      this.refreshKey,
      refreshToken
    );
  }

  setAccessToken(
    accessToken: string
  ): void {
    if (!isBrowser()) {
      return;
    }

    localStorage.setItem(
      this.accessKey,
      accessToken
    );
  }

  clear(): void {
    if (!isBrowser()) {
      return;
    }

    localStorage.removeItem(
      this.accessKey
    );

    localStorage.removeItem(
      this.refreshKey
    );
  }
}
