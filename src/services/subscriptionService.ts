import { authService } from "./authService";

const API_URL = 'http://127.0.0.1:8000/api';

export interface SubscriptionPlan {
  id: number;
  name: string;
  plan_type: string;
  description: string;
  price: number;
  max_boards: number;
  is_active: boolean;
}

export interface ClientSubscription {
  id: number;
  client_detail: { id: number; name: string; [key: string]: any };
  subscription_plan_detail: { id: number; name: string; [key: string]: any };
  start_date: string;
  end_date: string | null;
  status: string;
  payment_status: string;
}

export const subscriptionService = {
  async getPlans(): Promise<SubscriptionPlan[]> {
    const response = await authService.fetchWithAuth(`${API_URL}/subscription-plans/`);

    if (!response.ok) {
      throw new Error(`Failed to fetch plans (Status: ${response.status})`);
    }

    const json = await response.json();
    return json.data || [];
  },

  async getClientSubscriptions(): Promise<ClientSubscription[]> {
    const response = await authService.fetchWithAuth(`${API_URL}/client-subscriptions/`);

    if (!response.ok) {
      throw new Error(`Failed to fetch client subscriptions (Status: ${response.status})`);
    }

    const json = await response.json();
    return json.data || [];
  },

  // Plans CRUD
  async createPlan(data: any) {
    const response = await authService.fetchWithAuth(`${API_URL}/subscription-plans/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`Failed to create plan (${response.status})`);
    return await response.json();
  },

  async updatePlan(id: number, data: any) {
    const response = await authService.fetchWithAuth(`${API_URL}/subscription-plans/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`Failed to update plan (${response.status})`);
    return await response.json();
  },

  async deletePlan(id: number) {
    const response = await authService.fetchWithAuth(`${API_URL}/subscription-plans/${id}/`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(`Failed to delete plan (${response.status})`);
    return true;
  },

  // Client Subscriptions CRUD
  async createClientSubscription(data: any) {
    const response = await authService.fetchWithAuth(`${API_URL}/client-subscriptions/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`Failed to create subscription (${response.status})`);
    return await response.json();
  },

  async updateClientSubscription(id: number, data: any) {
    const response = await authService.fetchWithAuth(`${API_URL}/client-subscriptions/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`Failed to update subscription (${response.status})`);
    return await response.json();
  },

  async deleteClientSubscription(id: number) {
    const response = await authService.fetchWithAuth(`${API_URL}/client-subscriptions/${id}/`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(`Failed to delete subscription (${response.status})`);
    return true;
  }
};
