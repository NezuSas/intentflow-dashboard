export interface AuthSessionStorage {
  getAccessToken(): string | null;
  getRefreshToken(): string | null;

  setTokens(
    accessToken: string,
    refreshToken: string
  ): void;

  setAccessToken(
    accessToken: string
  ): void;

  clear(): void;
}
