export interface Client {
  id: number;
  name: string;
  type: string;
  subscription_level: string;
  identification_number: string | null;
  email: string | null;
  contact_name: string | null;
  phone: string | null;
  address: string | null;
  owner: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ClientPayload {
  name?: string;
  type?: string;
  subscription_level?: string;
  identification_number?: string;
  email?: string;
  contact_name?: string;
  phone?: string;
  address?: string;
  is_active?: boolean;
}
