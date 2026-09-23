import { API_URL } from "@/config/api";

import type {
  LoginResponse,
  RefreshResponse,
} from "../domain/Auth";

import type {
  AuthRepository,
} from "../domain/AuthRepository";

export class AuthApiRepository
  implements AuthRepository
{
  private async getErrorMessage(
    response: Response
  ): Promise<string> {
    const data = await response
      .json()
      .catch(() => null);

    if (
      data &&
      typeof data === "object"
    ) {
      const payload = data as Record<
        string,
        unknown
      >;

      if (
        typeof payload.detail ===
        "string"
      ) {
        return payload.detail;
      }

      if (
        typeof payload.message ===
        "string"
      ) {
        return payload.message;
      }
    }

    return `Authentication request failed (${response.status})`;
  }

  async login(
    email: string,
    password: string
  ): Promise<LoginResponse> {
    const response = await fetch(
      `${API_URL}/auth/login/`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        await this.getErrorMessage(
          response
        )
      );
    }

    return await response.json();
  }

  async refresh(
    refreshToken: string
  ): Promise<RefreshResponse> {
    const response = await fetch(
      `${API_URL}/auth/refresh/`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          refresh: refreshToken,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        await this.getErrorMessage(
          response
        )
      );
    }

    return await response.json();
  }

  async logout(
    accessToken: string,
    refreshToken: string
  ): Promise<void> {
    const response = await fetch(
      `${API_URL}/auth/logout/`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
          Authorization:
            `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          refresh: refreshToken,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        await this.getErrorMessage(
          response
        )
      );
    }
  }
}
