import { API_URL } from "@/config/api";

let refreshPromise: Promise<string | null> | null = null;

const isBrowser = () => typeof window !== "undefined";

function clearTokens() {
  if (!isBrowser()) return;

  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

export const authService = {
  async login(email: string, password: string) {
    const response = await fetch(`${API_URL}/auth/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail ||
        errorData.message ||
        "Login failed"
      );
    }

    const data = await response.json();

    if (isBrowser()) {
      if (data.access) {
        localStorage.setItem("access_token", data.access);
      }

      if (data.refresh) {
        localStorage.setItem("refresh_token", data.refresh);
      }
    }

    return data;
  },

  getAccessToken(): string | null {
    return isBrowser()
      ? localStorage.getItem("access_token")
      : null;
  },

  getRefreshToken(): string | null {
    return isBrowser()
      ? localStorage.getItem("refresh_token")
      : null;
  },

  hasSession(): boolean {
    return Boolean(
      this.getAccessToken() ||
      this.getRefreshToken()
    );
  },

  clearSession() {
    clearTokens();
  },

  async logout() {
    const refreshToken = this.getRefreshToken();
    let accessToken = this.getAccessToken();

    try {
      if (refreshToken) {
        const refreshedToken =
          await this.refreshAccessToken();

        if (refreshedToken) {
          accessToken = refreshedToken;
        }
      }

      if (refreshToken && accessToken) {
        await fetch(`${API_URL}/auth/logout/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            refresh: refreshToken,
          }),
        });
      }
    } catch {
      // El cierre local debe completarse aunque
      // el backend no esté disponible.
    } finally {
      clearTokens();

      if (isBrowser()) {
        window.dispatchEvent(
          new Event("intentflow:logout")
        );
      }
    }
  },

  async refreshAccessToken(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      return null;
    }

    // Si varias peticiones reciben 401 al mismo tiempo,
    // todas esperan la misma renovación.
    if (refreshPromise) {
      return refreshPromise;
    }

    refreshPromise = (async () => {
      try {
        const response = await fetch(`${API_URL}/auth/refresh/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            refresh: refreshToken,
          }),
        });

        if (!response.ok) {
          clearTokens();
          return null;
        }

        const data = await response.json();

        if (!data.access) {
          clearTokens();
          return null;
        }

        if (isBrowser()) {
          localStorage.setItem(
            "access_token",
            data.access
          );
        }

        return data.access as string;
      } catch {
        clearTokens();
        return null;
      }
    })();

    try {
      return await refreshPromise;
    } finally {
      refreshPromise = null;
    }
  },

  async fetchWithAuth(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    let token = this.getAccessToken();

    // Si no existe access token pero sí refresh,
    // intentar recuperar la sesión antes de consultar la API.
    if (!token && this.getRefreshToken()) {
      token = await this.refreshAccessToken();
    }

    const createHeaders = (
      accessToken: string | null
    ) => {
      const headers = new Headers(
        options.headers || {}
      );

      if (accessToken) {
        headers.set(
          "Authorization",
          `Bearer ${accessToken}`
        );
      }

      return headers;
    };

    let response = await fetch(url, {
      ...options,
      headers: createHeaders(token),
    });

    // Access token vencido.
    if (
      response.status === 401 &&
      this.getRefreshToken()
    ) {
      const newToken =
        await this.refreshAccessToken();

      if (newToken) {
        response = await fetch(url, {
          ...options,
          headers: createHeaders(newToken),
        });
      } else {
        this.logout();
      }
    }

    return response;
  },
};
