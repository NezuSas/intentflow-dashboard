// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import DashboardLayout from "@/app/dashboard/layout";
import DashboardPage from "@/app/dashboard/page";
import UsersPage from "@/app/dashboard/users/page";
import ClientsPage from "@/app/dashboard/clients/page";
import BoardsPage from "@/app/dashboard/boards/page";
import CommandsPage from "@/app/dashboard/commands/page";
import IntentsPage from "@/app/dashboard/intents/page";
import SubscriptionsPage from "@/app/dashboard/subscriptions/page";
import SettingsPage from "@/app/dashboard/settings/page";
import LoginPage from "@/app/login/page";
import { dashboardNavigation } from "@/shared/navigation/dashboardNavigation";

const mocks = vi.hoisted(() => {
  const service = (...methods: string[]) => Object.fromEntries(methods.map((method) => [method, vi.fn()]));
  return {
    push: vi.fn(), replace: vi.fn(),
    authTokenManager: service("hasSession", "getAccessToken", "getRefreshToken", "refreshAccessToken"),
    authService: service("login", "logout"),
    dashboardService: service("getStats"),
    userService: service("listUsers", "getCurrentUser", "createUser", "updateUser", "deleteUser", "toggleActive", "changeRole"),
    clientService: service("listClients", "getClientCatalog", "createClient", "updateClient", "deleteClient"),
    boardService: service("listBoards", "getBoardCatalog", "createBoard", "updateBoard", "deleteBoard"),
    versionService: service("getVersions"),
    commandService: service("listCommands", "createCommand", "updateCommand", "deleteCommand"),
    intentService: service("list"),
    subscriptionService: service("listPlans", "listClientSubscriptions", "getPlanCatalog", "createPlan", "updatePlan", "deletePlan", "createClientSubscription", "updateClientSubscription", "deleteClientSubscription"),
  };
});
vi.mock("@/composition", () => mocks);
vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({ push: mocks.push, replace: mocks.replace }),
}));

const meta = (count: number, page = 1) => ({ count, page, pageSize: 20, next: count > page * 20 ? "/next" : null, previous: page > 1 ? "/previous" : null });
const users = [
  { id: 1, email: "alice@example.test", first_name: "Alice", last_name: "One", role: "ADMIN", is_active: true, date_joined: "2026-01-01" },
  { id: 2, email: "bob@example.test", first_name: "Bob", last_name: "Two", role: "USER", is_active: false, date_joined: "2026-01-02" },
];
const clients = [
  { id: 1, name: "North Client", type: "COMPANY", subscription_level: "PREMIUM", identification_number: "1001", email: "north@example.test", contact_name: null, phone: null, address: null, owner: 1, is_active: true },
  { id: 2, name: "South Client", type: "PERSON", subscription_level: "FREE", identification_number: "1002", email: "south@example.test", contact_name: null, phone: null, address: null, owner: 1, is_active: false },
];
const versions = [{ id: 1, code: "v1", is_active: true }, { id: 2, code: "v2", is_active: true }];
const boards = [
  { id: 11, name: "Office Board", adb_identifier: "192.0.2.1:5555", client: 1, client_detail: { id: 1, name: "North Client" }, version: 1, version_detail: { id: 1, code: "v1" }, computed_status: "online", status: "ONLINE", is_active: true },
  { id: 12, name: "Lab Board", adb_identifier: "192.0.2.2:5555", client: 2, client_detail: { id: 2, name: "South Client" }, version: 2, version_detail: { id: 2, code: "v2" }, computed_status: "offline", status: "OFFLINE", is_active: false },
];
const plans = [
  { id: 21, name: "Starter Plan", plan_type: "BASIC", description: "Starter", price: 10, max_boards: 2, is_active: true },
  { id: 22, name: "Premium Plan", plan_type: "PREMIUM", description: "Premium", price: 20, max_boards: 10, is_active: false },
];
const commands = [
  { id: 31, key: "power_on", display_name: "Power On", description: "Start device", command: "input keyevent 26", versions: [1, 2], subscription_plans: [21, 22], subscription_plans_detail: [{ id: 21, name: "Starter Plan" }, { id: 22, name: "Premium Plan" }], is_active: true },
  { id: 32, key: "power_off", display_name: "Power Off", description: "Stop device", command: "input keyevent 26", versions: [2], subscription_plans: [22], subscription_plans_detail: [{ id: 22, name: "Premium Plan" }], is_active: false },
];
const intents = [
  { id: 41, board: { id: 11, name: "Office Board", adb_identifier: "192.0.2.1:5555", client: 1, client_detail: { id: 1, name: "North Client" } }, user: null, command_key: "power_on", resolved_command: "input keyevent 26", version_used: "v1", status: "OK", output: null, executed_at: "2026-09-23T13:00:00Z" },
  { id: 42, board: { id: 12, name: "Lab Board", adb_identifier: "192.0.2.2:5555", client: 2, client_detail: { id: 2, name: "South Client" } }, user: null, command_key: "power_off", resolved_command: "input keyevent 26", version_used: "v2", status: "ERROR", output: "ADB disconnected", executed_at: "2026-09-23T14:00:00Z" },
];
const subscriptions = [
  { id: 51, client_detail: { id: 1, name: "North Client" }, subscription_plan_detail: { id: 21, name: "Starter Plan" }, start_date: "2026-01-01", end_date: null, is_active: true, payment_status: "PAID" },
  { id: 52, client_detail: { id: 2, name: "South Client" }, subscription_plan_detail: { id: 22, name: "Premium Plan" }, start_date: "2026-02-01", end_date: "2026-12-31", is_active: false, payment_status: "PENDING" },
];

const routes = [
  { path: "/dashboard", Page: DashboardPage, text: "Recent Activity", empty: "No recent activity to display.", fail: mocks.dashboardService.getStats },
  { path: "/dashboard/users", Page: UsersPage, text: "alice@example.test", empty: "No users found.", fail: mocks.userService.listUsers },
  { path: "/dashboard/clients", Page: ClientsPage, text: "North Client", empty: "No clients found.", fail: mocks.clientService.listClients },
  { path: "/dashboard/boards", Page: BoardsPage, text: "Office Board", empty: "No boards found.", fail: mocks.boardService.listBoards },
  { path: "/dashboard/commands", Page: CommandsPage, text: "power_on", empty: "No commands found.", fail: mocks.commandService.listCommands },
  { path: "/dashboard/intents", Page: IntentsPage, text: "power_on", empty: "No intents found matching criteria.", fail: mocks.intentService.list },
  { path: "/dashboard/subscriptions", Page: SubscriptionsPage, text: "Starter Plan", empty: "No plans found.", fail: mocks.subscriptionService.listPlans },
] as const;

let container: HTMLDivElement;
let root: Root;
const render = async (Page: () => React.ReactNode) => act(async () => { root.render(createElement(Page)); });
const click = async (element: Element | null) => { expect(element).not.toBeNull(); await act(async () => { (element as HTMLElement).click(); }); };
const openSelect = async (element: Element | null) => {
  expect(element).not.toBeNull();
  await act(async () => { element?.querySelector(".ant-select-selector")?.dispatchEvent(new MouseEvent("mousedown", { bubbles: true })); });
};
const button = (label: string, scope: ParentNode = document.body) => [...scope.querySelectorAll("button")].find((item) => item.textContent?.includes(label)) ?? null;
const setInput = async (element: HTMLInputElement, value: string) => act(async () => {
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(element, value);
  element.dispatchEvent(new Event("input", { bubbles: true }));
});

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubGlobal("fetch", vi.fn(() => { throw new Error("Unexpected network request"); }));
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  Object.defineProperty(window, "matchMedia", { configurable: true, value: () => ({ matches: false, addListener: () => undefined, removeListener: () => undefined, addEventListener: () => undefined, removeEventListener: () => undefined }) });
  const getComputedStyle = window.getComputedStyle.bind(window);
  vi.spyOn(window, "getComputedStyle").mockImplementation((element) => getComputedStyle(element));
  class ResizeObserverMock { observe() {} unobserve() {} disconnect() {} }
  globalThis.ResizeObserver = ResizeObserverMock;
  window.scrollTo = vi.fn();
  mocks.authTokenManager.hasSession.mockReturnValue(true);
  mocks.authTokenManager.getAccessToken.mockReturnValue("mock-session");
  mocks.authTokenManager.getRefreshToken.mockReturnValue(null);
  mocks.dashboardService.getStats.mockResolvedValue({ total_intents_30d: 42, total_users: 2, total_clients: 2, active_boards: 1, recent_intents: intents });
  mocks.userService.listUsers.mockResolvedValue({ data: users, meta: meta(2) });
  mocks.userService.getCurrentUser.mockResolvedValue(users[0]);
  mocks.userService.createUser.mockResolvedValue(users[0]);
  mocks.clientService.listClients.mockResolvedValue({ data: clients, meta: meta(2) });
  mocks.clientService.getClientCatalog.mockResolvedValue(clients);
  mocks.boardService.listBoards.mockResolvedValue({ data: boards, meta: meta(2) });
  mocks.boardService.getBoardCatalog.mockResolvedValue(boards);
  mocks.versionService.getVersions.mockResolvedValue(versions);
  mocks.commandService.listCommands.mockResolvedValue({ data: commands, meta: meta(2) });
  mocks.intentService.list.mockResolvedValue({ data: intents, meta: meta(2) });
  mocks.subscriptionService.listPlans.mockResolvedValue({ data: plans, meta: meta(2) });
  mocks.subscriptionService.listClientSubscriptions.mockResolvedValue({ data: subscriptions, meta: meta(2) });
  mocks.subscriptionService.getPlanCatalog.mockResolvedValue(plans);
  container = document.createElement("div"); document.body.append(container); root = createRoot(container);
});
afterEach(async () => {
  await act(async () => { root.unmount(); });
  expect(globalThis.fetch).not.toHaveBeenCalled();
  document.body.replaceChildren();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("dashboard routes with mocked services", () => {
  it.each(routes)("renders $path with representative data", async ({ Page, text }) => {
    await render(Page);
    expect(container.textContent).toContain(text);
    expect(container.querySelectorAll(".ant-table-tbody tr.ant-table-row").length).toBeGreaterThanOrEqual(2);
  });

  it.each(routes)("renders $path loading state", async ({ Page, fail }) => {
    fail.mockReturnValue(new Promise(() => undefined));
    await render(Page);
    expect(container.querySelector('[role="status"]')).not.toBeNull();
    expect(container.querySelector(".ant-skeleton")).not.toBeNull();
  });

  it.each(routes)("renders $path empty state", async ({ Page, path, empty, fail }) => {
    if (path === "/dashboard") mocks.dashboardService.getStats.mockResolvedValue({ total_intents_30d: 0, total_users: 0, total_clients: 0, active_boards: 0, recent_intents: [] });
    else if (path === "/dashboard/subscriptions") {
      mocks.subscriptionService.listPlans.mockResolvedValue({ data: [], meta: meta(0) });
      mocks.subscriptionService.listClientSubscriptions.mockResolvedValue({ data: [], meta: meta(0) });
    } else fail.mockResolvedValue({ data: [], meta: meta(0) });
    await render(Page);
    expect(container.textContent).toContain(empty);
    if (path !== "/dashboard") expect(container.querySelector(".ant-empty")).not.toBeNull();
    if (path === "/dashboard/subscriptions") expect(container.textContent).toContain("No client subscriptions found.");
  });

  it.each(routes)("renders $path service error", async ({ Page, fail }) => {
    fail.mockRejectedValue(new Error("Mock service failure"));
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    await render(Page);
    expect(container.textContent).toContain("Mock service failure");
    expect(container.querySelector(".ant-alert-error")).not.toBeNull();
  });

  it("renders login and the authenticated user's profile", async () => {
    await render(LoginPage);
    expect(container.textContent).toContain("Sign In");
    await render(SettingsPage);
    expect(container.textContent).toContain("alice@example.test");
    expect(mocks.userService.getCurrentUser).toHaveBeenCalledOnce();
    expect(mocks.userService.listUsers).not.toHaveBeenCalled();
  });

  it("shows login error without a real auth request", async () => {
    mocks.authService.login.mockRejectedValue(new Error("Mock login failure"));
    await render(LoginPage);
    await act(async () => { container.querySelector("form")?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })); });
    expect(container.textContent).toContain("Mock login failure");
  });

  it("shows login loading while mocked authentication is pending", async () => {
    mocks.authService.login.mockReturnValue(new Promise(() => undefined));
    await render(LoginPage);
    await act(async () => { container.querySelector("form")?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })); });
    expect(container.textContent).toContain("Authenticating...");
  });

  it("shows Overview OK and ERROR rows and opens error details", async () => {
    await render(DashboardPage);
    expect(container.querySelectorAll(".ant-table-tbody tr.ant-table-row")).toHaveLength(2);
    expect(container.textContent).toContain("OK");
    await click(container.querySelector('button[aria-label="View error details for intent 42"]'));
    expect(document.body.textContent).toContain("ADB disconnected");
  });

  it("routes every sidebar item through router.push", async () => {
    await act(async () => { root.render(createElement(ThemeProvider, null, createElement(DashboardLayout, null, "Content"))); });
    for (const item of dashboardNavigation) {
      const menuItem = [...container.querySelectorAll(".ant-menu-item")].find((node) => node.textContent?.includes(item.label));
      await click(menuItem ?? null);
      expect(mocks.push).toHaveBeenLastCalledWith(item.key);
    }
  });

  it("opens Users edit modal and keeps role and status controls active", async () => {
    await render(UsersPage);
    const row = container.querySelector(".ant-table-tbody tr.ant-table-row");
    await click(button("Active", row ?? undefined));
    expect(mocks.userService.toggleActive).toHaveBeenCalledWith(1);
    await click(row?.querySelector('button[aria-label^="Edit user"]') ?? null);
    expect(document.body.textContent).toContain("Edit User Profile");
    await openSelect(document.body.querySelector(".ant-modal .ant-select"));
    expect(document.body.textContent).toContain("Standard User");
  });

  it("shows the backend-required password only when creating a user", async () => {
    await render(UsersPage);
    await click(button("New User", container));
    expect(document.body.querySelector('.ant-modal input[type="password"]')).not.toBeNull();
    expect(document.body.textContent).toContain("New users start with the User role");
    expect(document.body.querySelectorAll(".ant-modal .ant-select")).toHaveLength(0);
    const inputs = document.body.querySelectorAll(".ant-modal input") as NodeListOf<HTMLInputElement>;
    await setInput(inputs[0], "New");
    await setInput(inputs[1], "User");
    await setInput(inputs[2], "new@example.test");
    await setInput(inputs[3], "strong-password");
    await act(async () => { document.body.querySelector(".ant-modal form")?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })); });
    expect(mocks.userService.createUser).toHaveBeenCalledWith({ first_name: "New", last_name: "User", email: "new@example.test", password: "strong-password" });
  });

  it("opens Clients create and edit modals with form controls", async () => {
    await render(ClientsPage);
    await click(button("New Client", container));
    expect(document.body.textContent).toContain("Create New Client");
    expect(document.body.querySelector('input[type="email"]')).not.toBeNull();
    const clientName = document.body.querySelector(".ant-modal input") as HTMLInputElement;
    await setInput(clientName, "Test Client");
    expect(clientName.value).toBe("Test Client");
    await openSelect(document.body.querySelector(".ant-modal .ant-select"));
    expect(document.body.textContent).toContain("COMPANY");
    await click(button("Cancel"));
    await click(container.querySelector('.ant-table-tbody tr.ant-table-row button[aria-label^="Edit client"]'));
    expect(document.body.textContent).toContain("Edit Client");
  });

  it("opens Boards modal with client and version selects", async () => {
    await render(BoardsPage);
    await click(button("Register Board", container));
    expect(document.body.textContent).toContain("Register New Board");
    expect(document.body.querySelectorAll(".ant-modal .ant-select")).toHaveLength(3);
    expect(container.textContent).toContain("Lab Board");
    const selectors = document.body.querySelectorAll(".ant-modal .ant-select");
    await openSelect(selectors[0]);
    expect(document.body.querySelectorAll(".ant-select-item-option").length).toBeGreaterThanOrEqual(2);
    await click([...document.body.querySelectorAll(".ant-select-item-option")].find((item) => item.textContent?.includes("South Client")) ?? null);
    expect(selectors[0].textContent).toContain("South Client");
    await openSelect(selectors[1]);
    await click([...document.body.querySelectorAll(".ant-select-item-option")].find((item) => item.textContent?.includes("v2")) ?? null);
    expect(selectors[1].textContent).toContain("v2");
  });

  it("opens Commands modal and selects multiple versions and plans", async () => {
    await render(CommandsPage);
    await click(button("New Command", container));
    expect(document.body.textContent).toContain("New ADB Command");
    const checkboxes = document.body.querySelectorAll('.ant-modal input[type="checkbox"]');
    expect(checkboxes).toHaveLength(4);
    await click(checkboxes[0]); await click(checkboxes[1]); await click(checkboxes[2]); await click(checkboxes[3]);
    expect([...checkboxes].every((item) => (item as HTMLInputElement).checked)).toBe(true);
  });

  it("filters Intents, opens ERROR details and paginates", async () => {
    mocks.intentService.list.mockResolvedValue({ data: intents, meta: meta(40) });
    await render(IntentsPage);
    const filters = container.querySelectorAll(".ant-select");
    expect(filters).toHaveLength(2);
    await openSelect(filters[0]);
    await click([...document.body.querySelectorAll(".ant-select-item-option")].find((item) => item.textContent?.includes("North Client")) ?? null);
    expect(mocks.boardService.getBoardCatalog).toHaveBeenCalledWith(1);
    await openSelect(filters[1]);
    await click([...document.body.querySelectorAll(".ant-select-item-option")].find((item) => item.textContent?.includes("Office Board")) ?? null);
    expect(mocks.intentService.list).toHaveBeenLastCalledWith(expect.objectContaining({ client: 1, board: 11 }));
    const date = container.querySelector('input[type="date"]') as HTMLInputElement;
    await setInput(date, "2026-09-23");
    expect(mocks.intentService.list).toHaveBeenLastCalledWith(expect.objectContaining({ executedAtAfter: "2026-09-23T00:00:00-05:00" }));
    await click(container.querySelector('button[aria-label="View error details for intent 42"]'));
    expect(document.body.textContent).toContain("ADB disconnected");
    await click(button("Close", document.body.querySelector(".ant-modal") ?? undefined));
    await click(container.querySelector(".ant-pagination-next button"));
    expect(mocks.intentService.list).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 }));
  });

  it("opens both Subscription modals with populated catalogs", async () => {
    await render(SubscriptionsPage);
    expect(container.textContent).toContain("South Client");
    await click(button("New Plan", container));
    expect(document.body.textContent).toContain("Create New Plan");
    await click(button("Cancel"));
    await click(button("New Subscription", container));
    expect(document.body.textContent).toContain("Assign Plan to Client");
    expect(document.body.querySelector('.ant-modal input[type="date"]')).not.toBeNull();
    expect(document.body.querySelectorAll(".ant-modal .ant-select")).toHaveLength(4);
    expect(container.querySelectorAll(".ant-table-tbody tr.ant-table-row")).toHaveLength(4);
    const selectors = document.body.querySelectorAll(".ant-modal .ant-select");
    await openSelect(selectors[0]);
    await click([...document.body.querySelectorAll(".ant-select-item-option")].find((item) => item.textContent?.includes("North Client")) ?? null);
    expect(selectors[0].textContent).toContain("North Client");
    await openSelect(selectors[1]);
    await click([...document.body.querySelectorAll(".ant-select-item-option")].find((item) => item.textContent?.includes("Premium Plan")) ?? null);
    expect(selectors[1].textContent).toContain("Premium Plan");
  });
});
