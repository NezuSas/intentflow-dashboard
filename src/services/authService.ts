import { API_URL } from "@/config/api";

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
}

export const authService = {
  async login(email: string, password: string) {
    console.log('Attempting login at:', `${API_URL}/auth/login/`);
    const response = await fetch(`${API_URL}/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      console.error('Login failed with status:', response.status);
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || 'Login failed');
    }

    const data = await response.json();
    
    // Store tokens in localStorage
    if (data.access) {
      localStorage.setItem('access_token', data.access);
    }
    if (data.refresh) {
      localStorage.setItem('refresh_token', data.refresh);
    }
    
    return data;
  },

  async refreshAccessToken(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      console.warn('[AuthService] No refresh token available');
      return null;
    }

    if (isRefreshing) {
      // If already refreshing, wait for the new token
      return new Promise((resolve) => {
        subscribeTokenRefresh((token: string) => {
          resolve(token);
        });
      });
    }

    isRefreshing = true;

    try {
      console.log('[AuthService] Refreshing access token...');
      const response = await fetch(`${API_URL}/auth/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!response.ok) {
        console.error('[AuthService] Token refresh failed:', response.status);
        // Refresh token is invalid or expired, logout
        this.logout();
        return null;
      }

      const data = await response.json();
      
      if (data.access) {
        localStorage.setItem('access_token', data.access);
        console.log('[AuthService] Access token refreshed successfully');
        onTokenRefreshed(data.access);
        return data.access;
      }

      return null;
    } catch (error) {
      console.error('[AuthService] Token refresh error:', error);
      this.logout();
      return null;
    } finally {
      isRefreshing = false;
    }
  },

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
  },

  getAccessToken() {
    return typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  },

  getRefreshToken() {
    return typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
  },

  /**
   * Wrapper for fetch that automatically handles token refresh on 401 errors
   */
  async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const token = this.getAccessToken();
    
    // Add Authorization header
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    };

    let response = await fetch(url, { ...options, headers });

    // If 401, try to refresh token and retry
    if (response.status === 401) {
      console.log('[AuthService] 401 detected, attempting token refresh...');
      const newToken = await this.refreshAccessToken();
      
      if (newToken) {
        // Retry with new token
        const retryHeaders = {
          ...options.headers,
          'Authorization': `Bearer ${newToken}`,
        };
        response = await fetch(url, { ...options, headers: retryHeaders });
      }
    }

    return response;
  }
};
