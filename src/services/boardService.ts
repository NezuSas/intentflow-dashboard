import { authService } from "./authService";
import { API_URL } from "@/config/api";

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

export const boardService = {
  async getBoards(): Promise<Board[]> {
    const response =
      await authService.fetchWithAuth(
        `${API_URL}/boards/`
      );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch boards (Status: ${response.status})`
      );
    }

    const json = await response.json();
    return json.data || [];
  },

  async createBoard(data: BoardPayload) {
    const response =
      await authService.fetchWithAuth(
        `${API_URL}/boards/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({
          detail: "Failed to create board",
        }));

      throw new Error(error.detail);
    }

    return await response.json();
  },

  async updateBoard(
    boardId: number,
    data: BoardPayload
  ) {
    const response =
      await authService.fetchWithAuth(
        `${API_URL}/boards/${boardId}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({
          detail: "Failed to update board",
        }));

      throw new Error(error.detail);
    }

    return await response.json();
  },

  async deleteBoard(boardId: number) {
    const response =
      await authService.fetchWithAuth(
        `${API_URL}/boards/${boardId}/`,
        {
          method: "DELETE",
        }
      );

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({
          detail: "Failed to delete board",
        }));

      throw new Error(error.detail);
    }

    return true;
  },
};
