import { authService } from "./authService";
import { API_URL } from "@/config/api";

export interface ADBVersion {
  id: number;
  code: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export const versionService = {
  async getVersions(): Promise<ADBVersion[]> {
    const response =
      await authService.fetchWithAuth(
        `${API_URL}/adb-versions/`
      );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch versions (Status: ${response.status})`
      );
    }

    const json = await response.json();
    return json.data || [];
  },
};
