import type {
  Intent,
} from "@/features/intents";

export interface DashboardStats {
  total_intents_30d: number;
  total_users: number;
  total_clients: number;
  active_boards: number;
  recent_intents: Intent[];
}
