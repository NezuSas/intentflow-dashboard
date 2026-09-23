export interface SubscriptionPlan {
  id: number;
  name: string;
  plan_type: string;
  description: string;
  price: number | string;
  max_boards: number;
  is_active: boolean;
  created_at?: string;
}

export interface ClientSubscription {
  id: number;

  client_detail: {
    id: number;
    name: string;
    [key: string]: unknown;
  };

  subscription_plan_detail: {
    id: number;
    name: string;
    [key: string]: unknown;
  };

  start_date: string;
  end_date: string | null;
  is_active: boolean;
  payment_status: string;
}

export type SubscriptionPlanPayload =
  Record<string, unknown>;

export type ClientSubscriptionPayload =
  Record<string, unknown>;
