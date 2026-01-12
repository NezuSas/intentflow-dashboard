import { authService } from "./authService";

import { API_URL } from "@/config/api";

export interface Client {
  id: number;
  name: string;
  client_type: string;
  subscription_level: string;
  identification_number: string;
  email: string;
  phone: string;
  owner_email: string;
}

export const clientService = {
  async getClients(): Promise<Client[]> {
    const response = await authService.fetchWithAuth(`${API_URL}/clients/`);

    if (!response.ok) {
      throw new Error(`Failed to fetch clients (Status: ${response.status})`);
    }

    const json = await response.json();
    return json.data || [];
  },

  async createClient(data: any) {
    const response = await authService.fetchWithAuth(`${API_URL}/clients/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to create client' }));
      throw new Error(error.detail);
    }

    return await response.json();
  },

  async updateClient(clientId: number, data: any) {
    const response = await authService.fetchWithAuth(`${API_URL}/clients/${clientId}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to update client' }));
      throw new Error(error.detail);
    }

    return await response.json();
  },

  async deleteClient(clientId: number) {
    const response = await authService.fetchWithAuth(`${API_URL}/clients/${clientId}/`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to delete client' }));
      throw new Error(error.detail);
    }

    return true;
  }
};
