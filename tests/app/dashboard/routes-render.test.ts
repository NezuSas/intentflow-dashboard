import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { redirect } from "next/navigation";
import RootPage from "@/app/page";
import DashboardLayout from "@/app/dashboard/layout";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import DashboardHomePage from "@/app/dashboard/page";
import IntentsPage from "@/app/dashboard/intents/page";
import UsersPage from "@/app/dashboard/users/page";
import ClientsPage from "@/app/dashboard/clients/page";
import BoardsPage from "@/app/dashboard/boards/page";
import CommandsPage from "@/app/dashboard/commands/page";
import SubscriptionsPage from "@/app/dashboard/subscriptions/page";
import SettingsPage from "@/app/dashboard/settings/page";
import LoginPage from "@/app/login/page";

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
  usePathname: () => "/dashboard",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

describe("route initial render", () => {
  it("redirects the root route to login", () => {
    RootPage();
    expect(redirect).toHaveBeenCalledWith("/login");
  });

  it("renders the protected dashboard layout before session validation", () => {
    const markup = renderToStaticMarkup(createElement(ThemeProvider, null, createElement(DashboardLayout, null, "Dashboard")));
    expect(markup).toContain("Validating session...");
  });

  const routes = [
    ["/login", LoginPage],
    ["/dashboard", DashboardHomePage],
    ["/dashboard/intents", IntentsPage],
    ["/dashboard/users", UsersPage],
    ["/dashboard/clients", ClientsPage],
    ["/dashboard/boards", BoardsPage],
    ["/dashboard/commands", CommandsPage],
    ["/dashboard/subscriptions", SubscriptionsPage],
    ["/dashboard/settings", SettingsPage],
  ] as const;

  it.each(routes)("renders %s without a runtime exception", (_path, Page) => {
    expect(() => renderToStaticMarkup(createElement(Page))).not.toThrow();
  });
});
