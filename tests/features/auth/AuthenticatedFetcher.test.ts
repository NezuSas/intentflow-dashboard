import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import type {
  AuthSessionEvents,
} from "@/features/auth/domain/AuthSessionEvents";
import type {
  AuthTokenManager,
} from "@/features/auth/domain/AuthTokenManager";
import {
  AuthenticatedFetcher,
} from "@/features/auth/infrastructure/AuthenticatedFetcher";

const response = (status: number) =>
  new Response(null, { status });

describe("AuthenticatedFetcher", () => {
  it("does not dispatch a protected request when refresh fails before it", async () => {
    const fetcher = vi.fn();
    const tokens: AuthTokenManager = {
      getAccessToken: () => null,
      getRefreshToken: () => "refresh-token",
      hasSession: () => true,
      setTokens: () => undefined,
      clear: () => undefined,
      refreshAccessToken: async () => null,
    };
    const events: AuthSessionEvents = {
      notifyLogout: vi.fn(),
    };
    const authenticatedFetcher = new AuthenticatedFetcher(tokens, events, fetcher);

    await expect(
      authenticatedFetcher.fetch("https://api.example.com/protected")
    ).rejects.toThrow("Authentication refresh failed");

    expect(fetcher).not.toHaveBeenCalled();
    expect(events.notifyLogout).toHaveBeenCalledOnce();
  });

  it("retries a 401 request once with the refreshed bearer token", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(response(401))
      .mockResolvedValueOnce(response(200));
    const tokens: AuthTokenManager = {
      getAccessToken: () => "expired-token",
      getRefreshToken: () => "refresh-token",
      hasSession: () => true,
      setTokens: () => undefined,
      clear: () => undefined,
      refreshAccessToken: async () => "new-token",
    };
    const events: AuthSessionEvents = {
      notifyLogout: vi.fn(),
    };
    const authenticatedFetcher = new AuthenticatedFetcher(tokens, events, fetcher);

    await authenticatedFetcher.fetch("https://api.example.com/protected");

    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(
      new Headers(fetcher.mock.calls[1][1].headers).get("Authorization")
    ).toBe("Bearer new-token");
  });

  it("ends the session when a 401 has no refresh token", async () => {
    const fetcher = vi.fn().mockResolvedValue(response(401));
    const clear = vi.fn();
    const notifyLogout = vi.fn();
    const tokens: AuthTokenManager = {
      getAccessToken: () => "expired-token",
      getRefreshToken: () => null,
      hasSession: () => true,
      setTokens: () => undefined,
      clear,
      refreshAccessToken: vi.fn(),
    };
    const authenticatedFetcher = new AuthenticatedFetcher(
      tokens,
      { notifyLogout },
      fetcher
    );

    await expect(
      authenticatedFetcher.fetch("https://api.example.com/protected")
    ).rejects.toThrow("Authentication required");

    expect(fetcher).toHaveBeenCalledOnce();
    expect(clear).toHaveBeenCalledOnce();
    expect(notifyLogout).toHaveBeenCalledOnce();
  });

  it("ends the session when the refreshed token also gets a 401", async () => {
    const fetcher = vi.fn().mockResolvedValue(response(401));
    const clear = vi.fn();
    const notifyLogout = vi.fn();
    const tokens: AuthTokenManager = {
      getAccessToken: () => "expired-token",
      getRefreshToken: () => "refresh-token",
      hasSession: () => true,
      setTokens: () => undefined,
      clear,
      refreshAccessToken: async () => "new-token",
    };
    const authenticatedFetcher = new AuthenticatedFetcher(
      tokens,
      { notifyLogout },
      fetcher
    );

    await expect(
      authenticatedFetcher.fetch("https://api.example.com/protected")
    ).rejects.toThrow("Authentication required");

    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(clear).toHaveBeenCalledOnce();
    expect(notifyLogout).toHaveBeenCalledOnce();
  });
});
