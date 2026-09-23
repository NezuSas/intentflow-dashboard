import type {
  LoginResponse,
} from "../domain/Auth";

import type {
  AuthRepository,
} from "../domain/AuthRepository";

import type {
  AuthSessionStorage,
} from "../domain/AuthSessionStorage";

export class AuthService {
  private refreshPromise:
    Promise<string | null> | null = null;

  constructor(
    private readonly repository:
      AuthRepository,
    private readonly storage:
      AuthSessionStorage
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

    this.storage.setTokens(
      response.access,
      response.refresh
    );

    return response;
  }

  getAccessToken(): string | null {
    return this.storage
      .getAccessToken();
  }

  getRefreshToken(): string | null {
    return this.storage
      .getRefreshToken();
  }

  hasSession(): boolean {
    return Boolean(
      this.getAccessToken() ||
      this.getRefreshToken()
    );
  }

  clearSession(): void {
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

  async logout(): Promise<void> {
    const refreshToken =
      this.getRefreshToken();

    let accessToken =
      this.getAccessToken();

    try {
      if (
        !accessToken &&
        refreshToken
      ) {
        accessToken =
          await this.refreshAccessToken();
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
      // El cierre local continúa aunque
      // falle la revocación remota.
    } finally {
      this.storage.clear();

      if (
        typeof window !== "undefined"
      ) {
        window.dispatchEvent(
          new Event(
            "intentflow:logout"
          )
        );
      }
    }
  }

  async fetchWithAuth(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    let accessToken =
      this.getAccessToken();

    if (
      !accessToken &&
      this.getRefreshToken()
    ) {
      accessToken =
        await this.refreshAccessToken();
    }

    const createHeaders = (
      token: string | null
    ) => {
      const headers = new Headers(
        options.headers || {}
      );

      if (token) {
        headers.set(
          "Authorization",
          `Bearer ${token}`
        );
      }

      return headers;
    };

    let response = await fetch(
      url,
      {
        ...options,
        headers:
          createHeaders(accessToken),
      }
    );

    if (
      response.status === 401 &&
      this.getRefreshToken()
    ) {
      const newToken =
        await this.refreshAccessToken();

      if (newToken) {
        response = await fetch(
          url,
          {
            ...options,
            headers:
              createHeaders(newToken),
          }
        );
      } else {
        void this.logout();
      }
    }

    return response;
  }
}
