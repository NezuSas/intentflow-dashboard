import { describe, expect, it, vi } from "vitest";
import { ClientService } from "@/features/clients/application/ClientService";
import { CommandService } from "@/features/commands/application/CommandService";
import { DashboardService } from "@/features/dashboard/application/DashboardService";
import { IntentService } from "@/features/intents/application/IntentService";
import { UserService } from "@/features/users/application/UserService";
import { VersionService } from "@/features/versions/application/VersionService";
import type { ClientRepository } from "@/features/clients/domain/ClientRepository";
import type { CommandRepository } from "@/features/commands/domain/CommandRepository";
import type { DashboardRepository } from "@/features/dashboard/domain/DashboardRepository";
import type { IntentRepository } from "@/features/intents/domain/IntentRepository";
import type { UserRepository } from "@/features/users/domain/UserRepository";
import type { VersionRepository } from "@/features/versions/domain/VersionRepository";

const page = { data: [], meta: { count: 0, page: 1, pageSize: 20, next: null, previous: null } };

describe("application services", () => {
  it("delegates client list, catalog, and mutations", async () => {
    const list = vi.fn().mockResolvedValue(page); const catalog = vi.fn().mockResolvedValue([]); const create = vi.fn(); const update = vi.fn(); const remove = vi.fn();
    const service = new ClientService({ list, getCatalog: catalog, create, update, delete: remove } as unknown as ClientRepository);
    await service.listClients({ page: 2 }); await service.getClients(); await service.getClientCatalog(); await service.createClient({}); await service.updateClient(1, {}); await service.deleteClient(1);
    expect(list).toHaveBeenCalledWith({ page: 2 }); expect(list).toHaveBeenCalledWith({ page: 1, pageSize: 20 }); expect(catalog).toHaveBeenCalledOnce(); expect(create).toHaveBeenCalledWith({}); expect(update).toHaveBeenCalledWith(1, {}); expect(remove).toHaveBeenCalledWith(1);
  });

  it("delegates command list and mutations", async () => {
    const list = vi.fn().mockResolvedValue(page); const create = vi.fn(); const update = vi.fn(); const remove = vi.fn();
    const service = new CommandService({ list, create, update, delete: remove } as unknown as CommandRepository);
    await service.listCommands({ page: 2 }); await service.getCommands(); await service.createCommand({}); await service.updateCommand(1, {}); await service.deleteCommand(1);
    expect(list).toHaveBeenCalledWith({ page: 2 }); expect(list).toHaveBeenCalledWith({ page: 1, pageSize: 20 }); expect(create).toHaveBeenCalledWith({}); expect(update).toHaveBeenCalledWith(1, {}); expect(remove).toHaveBeenCalledWith(1);
  });

  it("delegates intent and dashboard reads", async () => {
    const list = vi.fn().mockResolvedValue(page); const stats = { total_intents_30d: 0 }; const getStats = vi.fn().mockResolvedValue(stats);
    const intents = new IntentService({ list } as unknown as IntentRepository); const dashboard = new DashboardService({ getStats } as unknown as DashboardRepository);
    await expect(intents.list({ client: 3, page: 2 })).resolves.toEqual(page); await expect(dashboard.getStats()).resolves.toEqual(stats); expect(list).toHaveBeenCalledWith({ client: 3, page: 2 }); expect(getStats).toHaveBeenCalledOnce();
  });

  it("delegates every user action", async () => {
    const list = vi.fn().mockResolvedValue(page); const getCurrent = vi.fn(); const create = vi.fn(); const toggleActive = vi.fn(); const changeRole = vi.fn(); const update = vi.fn(); const remove = vi.fn();
    const service = new UserService({ list, getCurrent, create, toggleActive, changeRole, update, delete: remove } as unknown as UserRepository);
    const newUser = { email: "new@example.test", first_name: "New", last_name: "User", password: "strong-password" };
    await service.listUsers({ page: 2 }); await service.getCurrentUser(); await service.createUser(newUser); await service.toggleActive(1); await service.changeRole(1, "ADMIN"); await service.updateUser(1, {}); await service.deleteUser(1);
    expect(list).toHaveBeenCalledWith({ page: 2 }); expect(getCurrent).toHaveBeenCalledOnce(); expect(create).toHaveBeenCalledWith(newUser); expect(toggleActive).toHaveBeenCalledWith(1); expect(changeRole).toHaveBeenCalledWith(1, "ADMIN"); expect(update).toHaveBeenCalledWith(1, {}); expect(remove).toHaveBeenCalledWith(1);
  });

  it("delegates version catalog reads", async () => {
    const getAll = vi.fn().mockResolvedValue([]); const service = new VersionService({ getAll } as unknown as VersionRepository);
    await expect(service.getVersions()).resolves.toEqual([]); expect(getAll).toHaveBeenCalledOnce();
  });
});
