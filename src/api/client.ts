import axios from 'axios';
import type { ApiError } from './types';
import { tokenStore } from './token';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true, // Cookies are sent with every request
});

// Request interceptor to add Authorization header
apiClient.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Refresh-token interceptor
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // If error is not 401, reject
    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    // Prevent infinite loops
    if (originalRequest._retry) {
      tokenStore.clear();
      return Promise.reject(error);
    }
    originalRequest._retry = true;

    // Do not attempt refresh for auth endpoints
    if (
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register') ||
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url?.includes('/auth/logout') ||
      originalRequest.url?.includes('/auth/me')
    ) {
      tokenStore.clear();
      return Promise.reject(error);
    }

    // Attempt to refresh token
    try {
      const res = await apiClient.post('/auth/refresh');
      tokenStore.set(res.data.access_token);
      originalRequest.headers.Authorization =
        `Bearer ${res.data.access_token}`;

      return apiClient(originalRequest);
    } catch {
      tokenStore.clear();
      window.location.href = '/login';
      return Promise.reject(error);
    }
  },
);

// Helper: to display error messages
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiError | undefined;

    if (apiError?.validationErrors) {
      return Object.values(apiError.validationErrors).flat().join(', ');
    }

    return apiError?.message || error.message || 'An unexpected error occurred';
  }

  return 'An unexpected error occurred';
};
