import { authService } from "./authService";

import { API_URL } from "@/config/api";

export interface ADBVersion {
  id: number;
  version_string: string;
  is_active: boolean;
}

export const versionService = {
  async getVersions(): Promise<ADBVersion[]> {
    const response = await authService.fetchWithAuth(`${API_URL}/adb-versions/`, {
      headers: {
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch versions (Status: ${response.status})`);
    }

    const json = await response.json();
    return json.data || [];
  }
};
