export interface AuthTokenManager {
  getAccessToken(): string | null;
  getRefreshToken(): string | null;

  hasSession(): boolean;

  setTokens(
    accessToken: string,
    refreshToken: string
  ): void;

  clear(): void;

  refreshAccessToken():
    Promise<string | null>;
}
