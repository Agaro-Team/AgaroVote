/**
 * Authenticated API Client
 *
 * Axios client that automatically includes JWT token from cookies
 * in the Authorization header for all requests
 */
import axios, { type AxiosError } from 'axios';

import { getAuthToken } from '../utils/cookie.client';

const API_BASE_URL = process.env.VITE_AGARO_VOTE_API_ENTRYPOINT || 'http://localhost:3000/api';

// Create full API URL with version
const FULL_API_URL = `${API_BASE_URL}/v1`;

/**
 * Create authenticated API client
 */
export const authenticatedApi = axios.create({
  baseURL: FULL_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies with requests
});

/**
 * Request interceptor: Add JWT token from cookie to Authorization header
 */
authenticatedApi.interceptors.request.use(
  (config) => {
    // Read token from cookie (client-side with proper URL decoding)
    const token = getAuthToken();
    console.log({ token });

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
authenticatedApi.interceptors.response.use(
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
