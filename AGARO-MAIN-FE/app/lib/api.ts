import axios, { AxiosError } from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API utilities for React Query
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Create axios instance with default configuration
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: 'https://jsonplaceholder.typicode.com', // TODO: Adjust this
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor
  client.interceptors.request.use(
    (config) => {
      // // Add auth token if available
      // const token = localStorage.getItem("authToken");
      // if (token) {
      //   config.headers.Authorization = `Bearer ${token}`;
      // }

      // Log request in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
      }

      return config;
    },
    (error) => {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      // Log response in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
      }
      return response;
    },
    (error: AxiosError) => {
      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        const { status, statusText, data } = error.response;
        const message = (data as any)?.message || `HTTP Error: ${status}`;

        console.error(`❌ API Error: ${status} ${statusText}`, data);

        throw new ApiError(message, status, statusText, data);
      } else if (error.request) {
        // Request was made but no response received
        console.error('❌ Network Error: No response received', error.request);
        throw new ApiError('Network Error: No response received', 0, 'Network Error');
      } else {
        // Something else happened
        console.error('❌ Request Error:', error.message);
        throw new ApiError(error.message, 0, 'Request Error');
      }
    }
  );

  return client;
};

// Create the API client instance
export const apiClient = createApiClient();

// Generic API client function with error handling
export async function apiRequest<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
  try {
    const response = await apiClient.request<T>({
      url: endpoint,
      ...config,
    });
    return response.data;
  } catch (error) {
    // Error is already handled by the response interceptor
    throw error;
  }
}

// HTTP method helpers
export const api = {
  // GET request
  get: <T>(endpoint: string, config?: AxiosRequestConfig) =>
    apiRequest<T>(endpoint, { ...config, method: 'GET' }),

  // POST request
  post: <T>(endpoint: string, data?: any, config?: AxiosRequestConfig) =>
    apiRequest<T>(endpoint, { ...config, method: 'POST', data }),

  // PUT request
  put: <T>(endpoint: string, data?: any, config?: AxiosRequestConfig) =>
    apiRequest<T>(endpoint, { ...config, method: 'PUT', data }),

  // PATCH request
  patch: <T>(endpoint: string, data?: any, config?: AxiosRequestConfig) =>
    apiRequest<T>(endpoint, { ...config, method: 'PATCH', data }),

  // DELETE request
  delete: <T>(endpoint: string, config?: AxiosRequestConfig) =>
    apiRequest<T>(endpoint, { ...config, method: 'DELETE' }),
} as const;
