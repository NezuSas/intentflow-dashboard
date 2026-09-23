export interface IntentClientDetail {
  id: number;
  name: string;
}

export interface IntentBoard {
  id: number;
  name: string;
  adb_identifier: string;
  client: number;
  client_detail?: IntentClientDetail;
  computed_status?: "online" | "offline";
  [key: string]: unknown;
}

export interface IntentUser {
  id: number;
  email: string;
  [key: string]: unknown;
}

export type IntentSource = "unknown" | "google_home" | "home_assistant" | "api";

export interface Intent {
  id: number;
  board: IntentBoard;
  user: IntentUser | null;
  command_key: string;
  resolved_command: string;
  version_used: string;
  status: string;
  source?: IntentSource | null;
  output: string | null;
  executed_at: string;
}
