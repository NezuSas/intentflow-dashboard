import { authService } from "./authService";
import { API_URL } from "@/config/api";

export interface IntentBoard {
  id: number;
  name: string;
  adb_identifier: string;
  client: number;
  client_detail?: {
    id: number;
    name: string;
  };
  computed_status?: "online" | "offline";
  [key: string]: unknown;
}

export interface IntentUser {
  id: number;
  email: string;
  [key: string]: unknown;
}

export interface Intent {
  id: number;
  board: IntentBoard;
  user: IntentUser | null;
  command_key: string;
  resolved_command: string;
  version_used: string;
  status: string;
  output: string | null;
  executed_at: string;
}

export const intentService = {
  async getIntents(): Promise<Intent[]> {
    const response =
      await authService.fetchWithAuth(
        `${API_URL}/intents/`
      );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch intents (Status: ${response.status})`
      );
    }

    const json = await response.json();
    return json.data || [];
  },
};
