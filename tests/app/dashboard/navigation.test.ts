import { describe, expect, it } from "vitest";
import { dashboardNavigation } from "@/shared/navigation/dashboardNavigation";

describe("dashboard navigation", () => {
  it("keeps every dashboard route available, including Intents", () => {
    expect(dashboardNavigation.map((item) => item.key)).toEqual([
      "/dashboard", "/dashboard/intents", "/dashboard/users", "/dashboard/clients",
      "/dashboard/boards", "/dashboard/commands", "/dashboard/subscriptions", "/dashboard/settings",
    ]);
  });
});
