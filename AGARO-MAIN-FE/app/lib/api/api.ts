import type { AxiosInstance, AxiosResponse, CreateAxiosDefaults } from 'axios';
import axios, { AxiosError } from 'axios';

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
export const createApiClient = (options?: CreateAxiosDefaults): AxiosInstance => {
  const client = axios.create({
    baseURL: 'https://jsonplaceholder.typicode.com', // TODO: Adjust this
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
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
