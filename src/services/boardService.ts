import { authService } from "./authService";

import { API_URL } from "@/config/api";

export interface Board {
  id: number;
  name: string;
  adb_identifier: string;
  client_name: string;
  version_name: string;
  is_active: boolean;
  last_activity: string;
}

export const boardService = {
  async getBoards(): Promise<Board[]> {
    const response = await authService.fetchWithAuth(`${API_URL}/boards/`);

    if (!response.ok) {
      throw new Error(`Failed to fetch boards (Status: ${response.status})`);
    }

    const json = await response.json();
    return json.data || [];
  },

  async createBoard(data: any) {
    const response = await authService.fetchWithAuth(`${API_URL}/boards/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to create board' }));
      throw new Error(error.detail);
    }

    return await response.json();
  },

  async updateBoard(boardId: number, data: any) {
    const response = await authService.fetchWithAuth(`${API_URL}/boards/${boardId}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to update board' }));
      throw new Error(error.detail);
    }

    return await response.json();
  },

  async deleteBoard(boardId: number) {
    const response = await authService.fetchWithAuth(`${API_URL}/boards/${boardId}/`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to delete board' }));
      throw new Error(error.detail);
    }

    return true;
  }
};
