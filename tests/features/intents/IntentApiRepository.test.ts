import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  HttpClient,
} from "@/core/http/HttpClient";

import type {
  Intent,
} from "@/features/intents/domain/Intent";

import {
  IntentApiRepository,
} from "@/features/intents/infrastructure/IntentApiRepository";

class FakeHttpClient implements HttpClient {
  requestedPath?: string;

  constructor(
    private readonly response: unknown
  ) {}

  async get<T>(path: string): Promise<T> {
    this.requestedPath = path;
    return this.response as T;
  }

  async post<T>(): Promise<T> {
    throw new Error("Not implemented for this test");
  }

  async patch<T>(): Promise<T> {
    throw new Error("Not implemented for this test");
  }

  async delete<T>(): Promise<T> {
    throw new Error("Not implemented for this test");
  }
}

const intent: Intent = {
  id: 7,
  board: {
    id: 3,
    name: "Office",
    adb_identifier: "10.0.0.3:5555",
    client: 9,
  },
  user: null,
  command_key: "open_home",
  resolved_command: "input keyevent HOME",
  version_used: "v1",
  status: "ok",
  output: null,
  executed_at: "2026-09-23T12:00:00-05:00",
};

describe("IntentApiRepository", () => {
  it("serializes the intent pagination and filter query parameters", async () => {
    const http = new FakeHttpClient({
      data: [intent],
      meta: {
        count: 41,
        page: 2,
        page_size: 20,
        next: "https://api.example.com/intents/?page=3",
        previous: "https://api.example.com/intents/?page=1",
      },
    });
    const repository = new IntentApiRepository(http);

    await repository.list({
      page: 2,
      pageSize: 20,
      client: 9,
      board: 3,
      status: "ok",
      executedAtAfter: "2026-09-23T00:00:00-05:00",
      executedAtBefore: "2026-09-24T00:00:00-05:00",
    });

    expect(http.requestedPath).toBe(
      "/intents/?page=2&page_size=20&client=9&board=3&status=ok&executed_at_after=2026-09-23T00%3A00%3A00-05%3A00&executed_at_before=2026-09-24T00%3A00%3A00-05%3A00"
    );
  });

  it("does not serialize undefined or empty query parameters", async () => {
    const http = new FakeHttpClient({
      data: [],
      meta: {
        count: 0,
        page: 1,
        page_size: 20,
        next: null,
        previous: null,
      },
    });
    const repository = new IntentApiRepository(http);

    await repository.list({
      page: 1,
      pageSize: 20,
      search: "",
      ordering: "",
      status: "",
      executedAtAfter: undefined,
      executedAtBefore: undefined,
    });

    expect(http.requestedPath).toBe("/intents/?page=1&page_size=20");
  });

  it("maps the API pagination metadata to the frontend contract", async () => {
    const http = new FakeHttpClient({
      data: [intent],
      meta: {
        count: 41,
        page: 2,
        page_size: 20,
        next: "https://api.example.com/intents/?page=3",
        previous: "https://api.example.com/intents/?page=1",
      },
    });
    const repository = new IntentApiRepository(http);

    const result = await repository.list();

    expect(result).toEqual({
      data: [intent],
      meta: {
        count: 41,
        page: 2,
        pageSize: 20,
        next: "https://api.example.com/intents/?page=3",
        previous: "https://api.example.com/intents/?page=1",
      },
    });
  });
});
