import { API_URL } from "@/config/api";
import { ApiClient } from "@/core/http/ApiClient";
import {
  authenticatedFetcher,
} from "@/features/auth";

export const httpClient =
  new ApiClient(
    API_URL,
    (url, options) =>
      authenticatedFetcher.fetch(
        url,
        options
      )
  );
