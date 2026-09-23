import {
  describe,
  expect,
  it,
} from "vitest";

import {
  JwtAuthTokenManager,
} from "@/features/auth/application/JwtAuthTokenManager";

import type {
  AuthRepository,
} from "@/features/auth/domain/AuthRepository";

import type {
  AuthSessionStorage,
} from "@/features/auth/domain/AuthSessionStorage";

class FakeAuthRepository
  implements AuthRepository
{
  refreshCalls = 0;

  async login() {
    return {
      access: "access",
      refresh: "refresh",
    };
  }

  async refresh(
    refreshToken: string
  ) {
    this.refreshCalls += 1;

    await Promise.resolve();

    return {
      access:
        `new-${refreshToken}`,
    };
  }

  async logout():
    Promise<void> {}
}

class FakeAuthStorage
  implements AuthSessionStorage
{
  accessToken:
    string | null = null;

  refreshToken:
    string | null = "refresh";

  getAccessToken() {
    return this.accessToken;
  }

  getRefreshToken() {
    return this.refreshToken;
  }

  setTokens(
    accessToken: string,
    refreshToken: string
  ): void {
    this.accessToken =
      accessToken;

    this.refreshToken =
      refreshToken;
  }

  setAccessToken(
    accessToken: string
  ): void {
    this.accessToken =
      accessToken;
  }

  clear(): void {
    this.accessToken = null;
    this.refreshToken = null;
  }
}

describe(
  "JwtAuthTokenManager",
  () => {
    it(
      "deduplicates concurrent refresh",
      async () => {
        const repository =
          new FakeAuthRepository();

        const storage =
          new FakeAuthStorage();

        const manager =
          new JwtAuthTokenManager(
            repository,
            storage
          );

        const results =
          await Promise.all([
            manager.refreshAccessToken(),
            manager.refreshAccessToken(),
            manager.refreshAccessToken(),
            manager.refreshAccessToken(),
            manager.refreshAccessToken(),
          ]);

        expect(
          repository.refreshCalls
        ).toBe(1);

        expect(results).toEqual([
          "new-refresh",
          "new-refresh",
          "new-refresh",
          "new-refresh",
          "new-refresh",
        ]);
      }
    );
  }
);
