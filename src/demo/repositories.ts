import type { ListQuery, PaginatedResponse } from "@/core/Pagination";
import type { AuthRepository, LoginResponse, RefreshResponse } from "@/features/auth";
import type { Board, BoardPayload, BoardRepository } from "@/features/boards";
import type { Client, ClientPayload, ClientRepository } from "@/features/clients";
import type { ADBCommand, CommandPayload, CommandRepository } from "@/features/commands";
import type { DashboardRepository, DashboardStats } from "@/features/dashboard";
import type { Intent, IntentListQuery, IntentRepository } from "@/features/intents";
import type {
  ClientSubscription, ClientSubscriptionPayload, ClientSubscriptionRepository,
  SubscriptionPlan, SubscriptionPlanPayload, SubscriptionPlanRepository,
} from "@/features/subscriptions";
import type { User, UserCreatePayload, UserRepository, UserUpdatePayload } from "@/features/users";
import type { ADBVersion, VersionRepository } from "@/features/versions";
import { DEMO_ACCOUNT } from "./demoMode";
import * as sample from "./data";

/**
 * In-memory repositories for the demo. They honour the same contracts as the API repositories:
 * paging, search, ordering and the create/update/delete flows the screens expose. Changes live
 * until the page is reloaded; nothing leaves the browser.
 */

const DEFAULT_PAGE_SIZE = 10;
const LATENCY_MS = 180;

const settle = <T>(value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS));

const matches = (item: unknown, search?: string): boolean => {
  if (!search) return true;
  const needle = search.trim().toLowerCase();
  return JSON.stringify(item).toLowerCase().includes(needle);
};

const order = <T>(items: T[], ordering?: string): T[] => {
  if (!ordering) return items;
  const descending = ordering.startsWith("-");
  const field = descending ? ordering.slice(1) : ordering;
  return [...items].sort((a, b) => {
    const left = String((a as Record<string, unknown>)[field] ?? "");
    const right = String((b as Record<string, unknown>)[field] ?? "");
    return descending ? right.localeCompare(left) : left.localeCompare(right);
  });
};

const paginate = <T>(all: T[], query: ListQuery = {}): PaginatedResponse<T> => {
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.max(1, query.pageSize ?? DEFAULT_PAGE_SIZE);
  const filtered = order(all.filter((item) => matches(item, query.search)), query.ordering);
  const start = (page - 1) * pageSize;
  const data = filtered.slice(start, start + pageSize);
  return {
    data,
    meta: {
      count: filtered.length,
      page,
      pageSize,
      next: start + pageSize < filtered.length ? String(page + 1) : null,
      previous: page > 1 ? String(page - 1) : null,
    },
  };
};

const nextId = (items: Array<{ id: number }>): number =>
  items.reduce((max, item) => Math.max(max, item.id), 0) + 1;

const stamp = (): string => new Date().toISOString();

class Store {
  boards = sample.boards.map((item) => ({ ...item }));
  clients = sample.clients.map((item) => ({ ...item }));
  commands = sample.commands.map((item) => ({ ...item }));
  users = sample.users.map((item) => ({ ...item }));
  plans = sample.plans.map((item) => ({ ...item }));
  subscriptions = sample.subscriptions.map((item) => ({ ...item }));
  readonly intents: Intent[] = sample.intents;
  readonly versions: ADBVersion[] = sample.versions;
}

export const demoStore = new Store();

export class DemoAuthRepository implements AuthRepository {
  async login(email: string): Promise<LoginResponse> {
    const current = demoStore.users[0];
    return settle({
      access: `demo-access-${Date.now()}`,
      refresh: "demo-refresh",
      user: {
        id: current.id, email: email || DEMO_ACCOUNT.email, first_name: current.first_name,
        last_name: current.last_name, full_name: `${current.first_name} ${current.last_name}`, role: current.role, is_active: true,
      },
    });
  }

  async refresh(): Promise<RefreshResponse> {
    return settle({ access: `demo-access-${Date.now()}` });
  }

  async logout(): Promise<void> {
    await settle(undefined);
  }
}

export class DemoBoardRepository implements BoardRepository {
  list(query?: ListQuery): Promise<PaginatedResponse<Board>> {
    return settle(paginate(demoStore.boards, query));
  }

  getCatalog(client?: number): Promise<Array<Pick<Board, "id" | "name" | "client">>> {
    const boards = client === undefined ? demoStore.boards : demoStore.boards.filter((board) => board.client === client);
    return settle(boards.map(({ id, name, client: owner }) => ({ id, name, client: owner })));
  }

  async create(data: BoardPayload): Promise<void> {
    const client = Number(data.client ?? demoStore.clients[0].id);
    const version = Number(data.version ?? demoStore.versions[0].id);
    const clientDetail = demoStore.clients.find((item) => item.id === client);
    const versionDetail = demoStore.versions.find((item) => item.id === version);
    demoStore.boards.unshift({
      id: nextId(demoStore.boards),
      name: String(data.name ?? "Nueva pantalla"),
      description: (data.description as string | null | undefined) ?? null,
      ip_address: String(data.ip_address ?? ""),
      port: Number(data.port ?? 5555),
      adb_identifier: String(data.adb_identifier ?? `${data.ip_address ?? "0.0.0.0"}:${data.port ?? 5555}`),
      status: "active",
      computed_status: "offline",
      type: String(data.type ?? "signage"),
      version,
      version_detail: versionDetail ? { id: versionDetail.id, code: versionDetail.code, description: versionDetail.description, is_active: versionDetail.is_active } : undefined,
      client,
      client_detail: clientDetail ? { id: clientDetail.id, name: clientDetail.name } : undefined,
      is_active: data.is_active === undefined ? true : Boolean(data.is_active),
      created_at: stamp(),
      updated_at: stamp(),
    });
    await settle(undefined);
  }

  async update(id: number, data: BoardPayload): Promise<void> {
    demoStore.boards = demoStore.boards.map((board) => {
      if (board.id !== id) return board;
      const client = data.client === undefined ? board.client : Number(data.client);
      const clientDetail = demoStore.clients.find((item) => item.id === client);
      return { ...board, ...data, client, client_detail: clientDetail ? { id: clientDetail.id, name: clientDetail.name } : board.client_detail, updated_at: stamp() } as Board;
    });
    await settle(undefined);
  }

  async delete(id: number): Promise<void> {
    demoStore.boards = demoStore.boards.filter((board) => board.id !== id);
    await settle(undefined);
  }
}

export class DemoClientRepository implements ClientRepository {
  list(query?: ListQuery): Promise<PaginatedResponse<Client>> {
    return settle(paginate(demoStore.clients, query));
  }

  getCatalog(): Promise<Array<Pick<Client, "id" | "name">>> {
    return settle(demoStore.clients.map(({ id, name }) => ({ id, name })));
  }

  async create(data: ClientPayload): Promise<void> {
    demoStore.clients.unshift({
      id: nextId(demoStore.clients),
      name: data.name ?? "Nuevo cliente",
      type: data.type ?? "retail",
      subscription_level: data.subscription_level ?? "basic",
      identification_number: data.identification_number ?? null,
      email: data.email ?? null,
      contact_name: data.contact_name ?? null,
      phone: data.phone ?? null,
      address: data.address ?? null,
      owner: 1,
      is_active: data.is_active ?? true,
      created_at: stamp(),
      updated_at: stamp(),
    });
    await settle(undefined);
  }

  async update(id: number, data: ClientPayload): Promise<void> {
    demoStore.clients = demoStore.clients.map((client) => (client.id === id ? { ...client, ...data, updated_at: stamp() } : client));
    await settle(undefined);
  }

  async delete(id: number): Promise<void> {
    demoStore.clients = demoStore.clients.filter((client) => client.id !== id);
    await settle(undefined);
  }
}

export class DemoCommandRepository implements CommandRepository {
  list(query?: ListQuery): Promise<PaginatedResponse<ADBCommand>> {
    return settle(paginate(demoStore.commands, query));
  }

  async create(data: CommandPayload): Promise<void> {
    const planIds = data.subscription_plans ?? [];
    demoStore.commands.unshift({
      id: nextId(demoStore.commands),
      key: data.key ?? `command_${Date.now()}`,
      display_name: data.display_name ?? null,
      description: data.description ?? null,
      command: data.command ?? "",
      versions: data.versions ?? [],
      subscription_plans: planIds,
      subscription_plans_detail: demoStore.plans.filter((plan) => planIds.includes(plan.id)).map(({ id, name, plan_type }) => ({ id, name, plan_type })),
      is_active: data.is_active ?? true,
      created_at: stamp(),
      updated_at: stamp(),
    });
    await settle(undefined);
  }

  async update(id: number, data: CommandPayload): Promise<void> {
    demoStore.commands = demoStore.commands.map((command) => {
      if (command.id !== id) return command;
      const planIds = data.subscription_plans ?? command.subscription_plans;
      return {
        ...command, ...data, subscription_plans: planIds,
        subscription_plans_detail: demoStore.plans.filter((plan) => planIds.includes(plan.id)).map(({ id: planId, name, plan_type }) => ({ id: planId, name, plan_type })),
        updated_at: stamp(),
      };
    });
    await settle(undefined);
  }

  async delete(id: number): Promise<void> {
    demoStore.commands = demoStore.commands.filter((command) => command.id !== id);
    await settle(undefined);
  }
}

export class DemoDashboardRepository implements DashboardRepository {
  getStats(): Promise<DashboardStats> {
    const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return settle({
      total_intents_30d: demoStore.intents.filter((intent) => Date.parse(intent.executed_at) >= monthAgo).length,
      total_users: demoStore.users.length,
      total_clients: demoStore.clients.length,
      active_boards: demoStore.boards.filter((board) => board.is_active && board.computed_status === "online").length,
      recent_intents: demoStore.intents.slice(0, 8),
    });
  }
}

export class DemoIntentRepository implements IntentRepository {
  list(query: IntentListQuery = {}): Promise<PaginatedResponse<Intent>> {
    const filtered = demoStore.intents.filter((intent) =>
      (query.client === undefined || intent.board.client === query.client)
      && (query.board === undefined || intent.board.id === query.board)
      && (!query.status || intent.status === query.status)
      && (!query.executedAtAfter || intent.executed_at >= query.executedAtAfter)
      && (!query.executedAtBefore || intent.executed_at <= query.executedAtBefore));
    return settle(paginate(filtered, query));
  }
}

export class DemoSubscriptionPlanRepository implements SubscriptionPlanRepository {
  list(query?: ListQuery): Promise<PaginatedResponse<SubscriptionPlan>> {
    return settle(paginate(demoStore.plans, query));
  }

  getCatalog(): Promise<Array<Pick<SubscriptionPlan, "id" | "name" | "price" | "plan_type">>> {
    return settle(demoStore.plans.map(({ id, name, price, plan_type }) => ({ id, name, price, plan_type })));
  }

  async create(data: SubscriptionPlanPayload): Promise<void> {
    demoStore.plans.unshift({
      id: nextId(demoStore.plans),
      name: String(data.name ?? "Nuevo plan"),
      plan_type: String(data.plan_type ?? "custom"),
      description: String(data.description ?? ""),
      price: (data.price as number | string | undefined) ?? "0.00",
      max_boards: Number(data.max_boards ?? 1),
      is_active: data.is_active === undefined ? true : Boolean(data.is_active),
      created_at: stamp(),
    });
    await settle(undefined);
  }

  async update(id: number, data: SubscriptionPlanPayload): Promise<void> {
    demoStore.plans = demoStore.plans.map((plan) => (plan.id === id ? ({ ...plan, ...data } as SubscriptionPlan) : plan));
    await settle(undefined);
  }

  async delete(id: number): Promise<void> {
    demoStore.plans = demoStore.plans.filter((plan) => plan.id !== id);
    await settle(undefined);
  }
}

export class DemoClientSubscriptionRepository implements ClientSubscriptionRepository {
  list(query?: ListQuery): Promise<PaginatedResponse<ClientSubscription>> {
    return settle(paginate(demoStore.subscriptions, query));
  }

  async create(data: ClientSubscriptionPayload): Promise<void> {
    const client = demoStore.clients.find((item) => item.id === Number(data.client)) ?? demoStore.clients[0];
    const plan = demoStore.plans.find((item) => item.id === Number(data.subscription_plan)) ?? demoStore.plans[0];
    demoStore.subscriptions.unshift({
      id: nextId(demoStore.subscriptions),
      client_detail: { id: client.id, name: client.name },
      subscription_plan_detail: { id: plan.id, name: plan.name },
      start_date: String(data.start_date ?? stamp().slice(0, 10)),
      end_date: (data.end_date as string | null | undefined) ?? null,
      is_active: data.is_active === undefined ? true : Boolean(data.is_active),
      payment_status: String(data.payment_status ?? "pending"),
    });
    await settle(undefined);
  }

  async update(id: number, data: ClientSubscriptionPayload): Promise<void> {
    demoStore.subscriptions = demoStore.subscriptions.map((subscription) => {
      if (subscription.id !== id) return subscription;
      const client = data.client === undefined ? undefined : demoStore.clients.find((item) => item.id === Number(data.client));
      const plan = data.subscription_plan === undefined ? undefined : demoStore.plans.find((item) => item.id === Number(data.subscription_plan));
      return {
        ...subscription, ...data,
        client_detail: client ? { id: client.id, name: client.name } : subscription.client_detail,
        subscription_plan_detail: plan ? { id: plan.id, name: plan.name } : subscription.subscription_plan_detail,
      } as ClientSubscription;
    });
    await settle(undefined);
  }

  async delete(id: number): Promise<void> {
    demoStore.subscriptions = demoStore.subscriptions.filter((subscription) => subscription.id !== id);
    await settle(undefined);
  }
}

export class DemoUserRepository implements UserRepository {
  list(query?: ListQuery): Promise<PaginatedResponse<User>> {
    return settle(paginate(demoStore.users, query));
  }

  getCurrent(): Promise<User> {
    return settle(demoStore.users[0]);
  }

  async create(data: UserCreatePayload): Promise<void> {
    demoStore.users.unshift({
      id: nextId(demoStore.users),
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      role: "operator",
      is_active: true,
      date_joined: stamp(),
    });
    await settle(undefined);
  }

  async toggleActive(id: number): Promise<void> {
    demoStore.users = demoStore.users.map((user) => (user.id === id ? { ...user, is_active: !user.is_active } : user));
    await settle(undefined);
  }

  async changeRole(id: number, role: string): Promise<void> {
    demoStore.users = demoStore.users.map((user) => (user.id === id ? { ...user, role } : user));
    await settle(undefined);
  }

  async update(id: number, data: UserUpdatePayload): Promise<void> {
    demoStore.users = demoStore.users.map((user) => (user.id === id ? { ...user, ...data } : user));
    await settle(undefined);
  }

  async delete(id: number): Promise<void> {
    demoStore.users = demoStore.users.filter((user) => user.id !== id);
    await settle(undefined);
  }
}

export class DemoVersionRepository implements VersionRepository {
  getAll(): Promise<ADBVersion[]> {
    return settle(demoStore.versions);
  }
}
