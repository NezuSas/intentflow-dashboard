import { API_URL } from "@/config/api";
import { ApiClient } from "@/core/http/ApiClient";
import { authService } from "@/features/auth";

export const httpClient =
  new ApiClient(
    API_URL,
    (url, options) =>
      authService.fetchWithAuth(
        url,
        options
      )
  );
