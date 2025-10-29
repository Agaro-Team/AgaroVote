import type { AxiosError, AxiosRequestConfig } from 'axios';

import { getAuthToken } from '../utils/cookie.client';
import { createApiClient } from './api.client';

const agaroApiClient = createApiClient({
  baseURL: import.meta.env.VITE_AGARO_VOTE_API_ENTRYPOINT,
});

/**
 * Request interceptor: Add JWT token from cookie to Authorization header
 */
agaroApiClient.interceptors.request.use(
  (config) => {
    // Read token from cookie (client-side with proper URL decoding)
    const token = getAuthToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔐 Auth API Request: ${config.method?.toUpperCase()} ${config.url}`);
      if (token) {
        console.log(`🔑 Token: ${token.substring(0, 20)}...`);
      }
    }

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor: Handle 401 errors (token expired/invalid)
 */
agaroApiClient.interceptors.response.use(
  (response) => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Auth API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.warn('401 Unauthorized - signing out and redirecting');

      // Sign out and redirect to home
      try {
        await fetch('/auth/signout', { method: 'POST' });
      } catch (signOutError) {
        console.error('Error during sign out:', signOutError);
      }

      // Redirect to home with error message
      window.location.href = '/?error=session-expired';
    } else if (error.response) {
      // Server responded with error status
      const { status, statusText, data } = error.response;
      const message = (data as any)?.message || `HTTP Error: ${status}`;

      console.error(`❌ Auth API Error: ${status} ${statusText}`, data);

      throw new Error(message);
    } else if (error.request) {
      // Request made but no response received
      console.error('❌ Network Error: No response received', error.request);
      throw new Error('Network Error: No response received');
    } else {
      // Something else happened
      console.error('❌ Request Error:', error.message);
      throw new Error(error.message);
    }

    return Promise.reject(error);
  }
);

// Generic API client function with error handling
async function agaroApiRequest<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
  try {
    const response = await agaroApiClient.request<T>({
      url: endpoint,
      ...config,
    });
    return response.data;
  } catch (error) {
    // Error is already handled by the response interceptor
    throw error;
  }
}

export const agaroApi = {
  get: <T>(endpoint: string, config?: AxiosRequestConfig) =>
    agaroApiRequest<T>(endpoint, { ...config, method: 'GET' }),

  post: <T>(endpoint: string, data?: any, config?: AxiosRequestConfig) =>
    agaroApiRequest<T>(endpoint, { ...config, method: 'POST', data }),

  put: <T>(endpoint: string, data?: any, config?: AxiosRequestConfig) =>
    agaroApiRequest<T>(endpoint, { ...config, method: 'PUT', data }),

  patch: <T>(endpoint: string, data?: any, config?: AxiosRequestConfig) =>
    agaroApiRequest<T>(endpoint, { ...config, method: 'PATCH', data }),

  delete: <T>(endpoint: string, config?: AxiosRequestConfig) =>
    agaroApiRequest<T>(endpoint, { ...config, method: 'DELETE' }),
} as const;
