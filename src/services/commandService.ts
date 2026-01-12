import { authService } from "./authService";

import { API_URL } from "@/config/api";

export interface ADBCommand {
  id: number;
  key: string;
  display_name: string;
  description: string;
  command: string;
  subscription_plans: { id: number; name: string }[];
}

export const commandService = {
  async getCommands(): Promise<ADBCommand[]> {
    const token = authService.getAccessToken();
    const response = await fetch(`${API_URL}/adb-commands/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch commands (Status: ${response.status})`);
    }

    const json = await response.json();
    return json.data || [];
  },

  async createCommand(data: any) {
    const token = authService.getAccessToken();
    const response = await fetch(`${API_URL}/adb-commands/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
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

  async updateCommand(commandId: number, data: any) {
    const token = authService.getAccessToken();
    const response = await fetch(`${API_URL}/adb-commands/${commandId}/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
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
    const token = authService.getAccessToken();
    const response = await fetch(`${API_URL}/adb-commands/${commandId}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to delete command' }));
      throw new Error(error.detail);
    }

    return true;
  }
};
