import { ApiError } from "@/core/errors/ApiError";
import type { HttpClient } from "./HttpClient";

export type HttpFetcher = (
  url: string,
  options?: RequestInit
) => Promise<Response>;

export class ApiClient
  implements HttpClient
{
  constructor(
    private readonly baseUrl: string,
    private readonly fetcher: HttpFetcher
  ) {}

  private buildUrl(
    path: string
  ): string {
    const normalizedPath =
      path.startsWith("/")
        ? path
        : `/${path}`;

    return `${this.baseUrl}${normalizedPath}`;
  }

  private async parseResponse(
    response: Response
  ): Promise<unknown> {
    const text =
      await response.text();

    if (!text) {
      return null;
    }

    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  private getErrorMessage(
    payload: unknown,
    status: number
  ): string {
    if (
      payload &&
      typeof payload === "object"
    ) {
      const data =
        payload as Record<
          string,
          unknown
        >;

      if (
        typeof data.detail ===
        "string"
      ) {
        return data.detail;
      }

      if (
        typeof data.message ===
        "string"
      ) {
        return data.message;
      }
    }

    return `API request failed (${status})`;
  }

  async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response =
      await this.fetcher(
        this.buildUrl(path),
        options
      );

    const payload =
      await this.parseResponse(
        response
      );

    if (!response.ok) {
      throw new ApiError(
        this.getErrorMessage(
          payload,
          response.status
        ),
        response.status,
        payload
      );
    }

    return payload as T;
  }

  get<T>(
    path: string
  ): Promise<T> {
    return this.request<T>(path);
  }

  post<T>(
    path: string,
    body?: unknown
  ): Promise<T> {
    return this.request<T>(
      path,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body:
          body === undefined
            ? undefined
            : JSON.stringify(body),
      }
    );
  }

  patch<T>(
    path: string,
    body?: unknown
  ): Promise<T> {
    return this.request<T>(
      path,
      {
        method: "PATCH",
        headers: {
          "Content-Type":
            "application/json",
        },
        body:
          body === undefined
            ? undefined
            : JSON.stringify(body),
      }
    );
  }

  delete<T>(
    path: string
  ): Promise<T> {
    return this.request<T>(
      path,
      {
        method: "DELETE",
      }
    );
  }
}
