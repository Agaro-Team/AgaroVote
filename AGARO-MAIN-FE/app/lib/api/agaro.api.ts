import type { AxiosRequestConfig } from 'axios';

import { createApiClient } from './api';

const agaroApiClient = createApiClient({
  baseURL: import.meta.env.VITE_AGARO_VOTE_API_ENTRYPOINT,
});

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
