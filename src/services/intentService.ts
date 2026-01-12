import { authService } from "./authService";

import { API_URL } from "@/config/api";

export interface Intent {
  id: number;
  board: { id: number; name: string; adb_identifier: string; [key: string]: any };
  user: { id: number; email: string; [key: string]: any } | null;
  command_key: string;
  resolved_command: string;
  version_used: string;
  status: string;
  output: string | null;
  executed_at: string;
}

export const intentService = {
  async getIntents() {
    console.log('Fetching intents from:', `${API_URL}/intents/`);
    
    try {
      const response = await authService.fetchWithAuth(`${API_URL}/intents/`);

      if (!response.ok) {
        console.error('Fetch intents failed with status:', response.status);
        const errorText = await response.text();
        console.error('Error body:', errorText);
        throw new Error(`Failed to fetch intents (Status: ${response.status})`);
      }

      const json = await response.json();
      console.log('Fetch intents success:', json);
      
      // The backend returns { "data": [...], "meta": {...} } or { "data": [...] }
      return json.data || [];
    } catch (error) {
      console.error('Fetch intents exception:', error);
      throw error;
    }
  }
};
