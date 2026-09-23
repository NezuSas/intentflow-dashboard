export interface BoardClientDetail {
  id: number;
  name: string;
}

export interface BoardVersionDetail {
  id: number;
  code: string;
  description?: string;
  is_active?: boolean;
}

export interface Board {
  id: number;
  name: string;
  description?: string | null;
  ip_address?: string;
  port?: number;
  adb_identifier: string;
  status?: string;
  computed_status?: "online" | "offline";
  type?: string;

  version: number;
  version_detail?: BoardVersionDetail;

  client: number;
  client_detail?: BoardClientDetail;

  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export type BoardPayload =
  Record<string, unknown>;
