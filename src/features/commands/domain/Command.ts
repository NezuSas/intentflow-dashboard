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

export interface CommandPayload {
  key?: string;
  display_name?: string | null;
  description?: string | null;
  command?: string;
  versions?: number[];
  subscription_plans?: number[];
  is_active?: boolean;
}
