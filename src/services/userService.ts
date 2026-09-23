import { authService } from "./authService";

import { API_URL } from "@/config/api";

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  date_joined: string;
}

export const userService = {
  async getUsers(): Promise<User[]> {
    const response = await authService.fetchWithAuth(`${API_URL}/auth/users/`, {
      headers: {
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch users (Status: ${response.status})`);
    }

    const json = await response.json();
    return json.data || [];
  },

  async toggleActive(userId: number) {
    const response = await authService.fetchWithAuth(`${API_URL}/auth/users/${userId}/toggle-active/`, {
      method: 'POST',
      headers: {
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to toggle status' }));
      throw new Error(error.detail);
    }

    return await response.json();
  },

  async changeRole(userId: number, role: string) {
    const response = await authService.fetchWithAuth(`${API_URL}/auth/users/${userId}/change-role/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to change role' }));
      throw new Error(error.detail);
    }

    return await response.json();
  },

  async updateUser(userId: number, data: Partial<User>) {
    const response = await authService.fetchWithAuth(`${API_URL}/auth/users/${userId}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to update user' }));
      throw new Error(error.detail);
    }

    return await response.json();
  },

  async deleteUser(userId: number) {
    const response = await authService.fetchWithAuth(`${API_URL}/auth/users/${userId}/`, {
      method: 'DELETE',
      headers: {
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to delete user' }));
      throw new Error(error.detail);
    }

    return true;
  }
};
