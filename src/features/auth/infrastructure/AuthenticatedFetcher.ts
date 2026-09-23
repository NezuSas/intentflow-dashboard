import type {
  AuthTokenManager,
} from "../domain/AuthTokenManager";

import type {
  AuthSessionEvents,
} from "../domain/AuthSessionEvents";

export type RawFetcher = (
  url: string,
  options?: RequestInit
) => Promise<Response>;

export class AuthenticatedFetcher {
  constructor(
    private readonly tokens:
      AuthTokenManager,
    private readonly events:
      AuthSessionEvents,
    private readonly fetcher:
      RawFetcher
  ) {}

  private createHeaders(
    options: RequestInit,
    token: string | null
  ): Headers {
    const headers =
      new Headers(
        options.headers || {}
      );

    if (token) {
      headers.set(
        "Authorization",
        `Bearer ${token}`
      );
    }

    return headers;
  }

  async fetch(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    let accessToken =
      this.tokens.getAccessToken();

    if (
      !accessToken &&
      this.tokens.getRefreshToken()
    ) {
      accessToken =
        await this.tokens
          .refreshAccessToken();

      if (!accessToken) {
        this.events.notifyLogout();
      }
    }

    let response =
      await this.fetcher(
        url,
        {
          ...options,
          headers:
            this.createHeaders(
              options,
              accessToken
            ),
        }
      );

    if (
      response.status === 401 &&
      this.tokens.getRefreshToken()
    ) {
      const newToken =
        await this.tokens
          .refreshAccessToken();

      if (newToken) {
        response =
          await this.fetcher(
            url,
            {
              ...options,
              headers:
                this.createHeaders(
                  options,
                  newToken
                ),
            }
          );
      } else {
        this.events.notifyLogout();
      }
    }

    return response;
  }
}
