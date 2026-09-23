import { authService } from "./authService";

import { API_URL } from "@/config/api";

export interface CommandPlanDetail {
  id: number;
  name: string;
  plan_type?: string;
}

export interface ADBCommand {
  id: number;
  key: string;
  display_name: string | null;
  description: string | null;
  command: string;
  versions: number[];
  subscription_plans: number[];
  subscription_plans_detail?: CommandPlanDetail[];
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export const commandService = {
  async getCommands(): Promise<ADBCommand[]> {
    const response = await authService.fetchWithAuth(`${API_URL}/adb-commands/`, {
      headers: {
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch commands (Status: ${response.status})`);
    }

    const json = await response.json();
    return json.data || [];
  },

  async createCommand(data: Record<string, unknown>) {
    const response = await authService.fetchWithAuth(`${API_URL}/adb-commands/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to create command' }));
      throw new Error(error.detail);
    }

    return await response.json();
  },

  async updateCommand(commandId: number, data: Record<string, unknown>) {
    const response = await authService.fetchWithAuth(`${API_URL}/adb-commands/${commandId}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to update command' }));
      throw new Error(error.detail);
    }

    return await response.json();
  },

  async deleteCommand(commandId: number) {
    const response = await authService.fetchWithAuth(`${API_URL}/adb-commands/${commandId}/`, {
      method: 'DELETE',
      headers: {
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to delete command' }));
      throw new Error(error.detail);
    }

    return true;
  }
};
