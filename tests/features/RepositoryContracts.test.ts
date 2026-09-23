import { describe, expect, it } from "vitest";
import type { HttpClient } from "@/core/http/HttpClient";
import { BoardApiRepository } from "@/features/boards/infrastructure/BoardApiRepository";
import { ClientApiRepository } from "@/features/clients/infrastructure/ClientApiRepository";
import { CommandApiRepository } from "@/features/commands/infrastructure/CommandApiRepository";
import { DashboardApiRepository } from "@/features/dashboard/infrastructure/DashboardApiRepository";
import { IntentApiRepository } from "@/features/intents/infrastructure/IntentApiRepository";
import { ClientSubscriptionApiRepository } from "@/features/subscriptions/infrastructure/ClientSubscriptionApiRepository";
import { SubscriptionPlanApiRepository } from "@/features/subscriptions/infrastructure/SubscriptionPlanApiRepository";
import { UserApiRepository } from "@/features/users/infrastructure/UserApiRepository";
import { VersionApiRepository } from "@/features/versions/infrastructure/VersionApiRepository";

class FakeHttpClient implements HttpClient {
  calls: Array<{ method: string; path: string; body?: unknown }> = [];
  constructor(private response: unknown) {}
  async get<T>(path: string): Promise<T> { this.calls.push({ method: "GET", path }); return this.response as T; }
  async post<T>(path: string, body?: unknown): Promise<T> { this.calls.push({ method: "POST", path, body }); return undefined as T; }
  async patch<T>(path: string, body?: unknown): Promise<T> { this.calls.push({ method: "PATCH", path, body }); return undefined as T; }
  async delete<T>(path: string): Promise<T> { this.calls.push({ method: "DELETE", path }); return undefined as T; }
}

const paginated = { data: [], meta: { count: 0, page: 2, page_size: 25, next: null, previous: null } };

describe("API repository contracts", () => {
  it("maps users pagination and mutation endpoints", async () => {
    const http = new FakeHttpClient(paginated); const repository = new UserApiRepository(http);
    const response = await repository.list({ page: 2, pageSize: 25 }); await repository.toggleActive(7); await repository.changeRole(7, "ADMIN"); await repository.update(7, {}); await repository.delete(7);
    expect(response.meta.pageSize).toBe(25); expect(http.calls).toEqual(expect.arrayContaining([{ method: "GET", path: "/auth/users/?page=2&page_size=25" }, { method: "POST", path: "/auth/users/7/toggle-active/" }, { method: "POST", path: "/auth/users/7/change-role/", body: { role: "ADMIN" } }, { method: "PATCH", path: "/auth/users/7/", body: {} }, { method: "DELETE", path: "/auth/users/7/" }]));
  });

  it("uses the backend user creation and current-profile contracts", async () => {
    const profile = { id: 7, email: "new@example.test", first_name: "New", last_name: "User", role: "USER", is_active: true, date_joined: "2026-09-23" };
    const http = new FakeHttpClient({ data: profile });
    const repository = new UserApiRepository(http);
    const payload = { email: profile.email, first_name: profile.first_name, last_name: profile.last_name, password: "strong-password" };

    expect(await repository.getCurrent()).toEqual(profile);
    await repository.create(payload);
    expect(http.calls).toEqual([
      { method: "GET", path: "/auth/users/me/" },
      { method: "POST", path: "/auth/users/", body: payload },
    ]);
  });

  it("uses the client collection and catalog contracts", async () => {
    const http = new FakeHttpClient(paginated); const repository = new ClientApiRepository(http);
    await repository.list({ page: 1, pageSize: 20 }); await repository.getCatalog(); await repository.create({}); await repository.update(2, {}); await repository.delete(2);
    expect(http.calls.map((call) => call.path)).toEqual(["/clients/?page=1&page_size=20", "/clients/catalog/", "/clients/", "/clients/2/", "/clients/2/"]);
  });

  it("uses board list, catalog, and mutation contracts", async () => {
    const http = new FakeHttpClient(paginated); const repository = new BoardApiRepository(http);
    await repository.list({ page: 1, pageSize: 20 }); await repository.getCatalog(3); await repository.create({}); await repository.update(4, {}); await repository.delete(4);
    expect(http.calls.map((call) => call.path)).toEqual(["/boards/?page=1&page_size=20", "/boards/catalog/?client=3", "/boards/", "/boards/4/", "/boards/4/"]);
  });

  it("uses command endpoints with paginated lists", async () => {
    const http = new FakeHttpClient(paginated); const repository = new CommandApiRepository(http);
    const response = await repository.list({ page: 2, pageSize: 25 }); await repository.create({}); await repository.update(5, {}); await repository.delete(5);
    expect(response.meta.pageSize).toBe(25); expect(http.calls.map((call) => call.path)).toEqual(["/adb-commands/?page=2&page_size=25", "/adb-commands/", "/adb-commands/5/", "/adb-commands/5/"]);
  });

  it("uses the dashboard and version read endpoints", async () => {
    const dashboardHttp = new FakeHttpClient({ data: { total_intents_30d: 0 } }); const versionHttp = new FakeHttpClient({ data: [] });
    await new DashboardApiRepository(dashboardHttp).getStats(); await new VersionApiRepository(versionHttp).getAll();
    expect(dashboardHttp.calls[0]).toEqual({ method: "GET", path: "/intents/stats/" }); expect(versionHttp.calls[0]).toEqual({ method: "GET", path: "/adb-versions/catalog/" });
  });

  it("uses subscription plan and client subscription endpoints", async () => {
    const planHttp = new FakeHttpClient(paginated); const subscriptionHttp = new FakeHttpClient(paginated);
    const plans = new SubscriptionPlanApiRepository(planHttp); const subscriptions = new ClientSubscriptionApiRepository(subscriptionHttp);
    await plans.list({ page: 1, pageSize: 20 }); await plans.getCatalog(); await plans.create({}); await plans.update(6, {}); await plans.delete(6);
    const response = await subscriptions.list({ page: 2, pageSize: 25 }); await subscriptions.create({}); await subscriptions.update(7, {}); await subscriptions.delete(7);
    expect(response.meta.pageSize).toBe(25); expect(planHttp.calls.map((call) => call.path)).toEqual(["/subscription-plans/?page=1&page_size=20", "/subscription-plans/catalog/", "/subscription-plans/", "/subscription-plans/6/", "/subscription-plans/6/"]); expect(subscriptionHttp.calls.map((call) => call.path)).toEqual(["/client-subscriptions/?page=2&page_size=25", "/client-subscriptions/", "/client-subscriptions/7/", "/client-subscriptions/7/"]);
  });

  it("serializes intent filters through the intent repository", async () => {
    const http = new FakeHttpClient(paginated); const repository = new IntentApiRepository(http);
    const response = await repository.list({ page: 2, pageSize: 25, client: 3, board: 4, status: "ERROR", executedAtAfter: "2026-09-23T00:00:00-05:00", executedAtBefore: "2026-09-24T00:00:00-05:00" });
    expect(response.meta.pageSize).toBe(25); expect(http.calls[0].path).toContain("/intents/?page=2&page_size=25&client=3&board=4&status=ERROR"); expect(http.calls[0].path).toContain("executed_at_after="); expect(http.calls[0].path).toContain("executed_at_before=");
  });
});
