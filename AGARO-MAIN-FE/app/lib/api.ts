// API utilities for React Query
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Generic API client with error handling
export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(endpoint, config);

    if (!response.ok) {
      throw new ApiError(
        `HTTP Error: ${response.status}`,
        response.status,
        response.statusText
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Network or other errors
    throw new ApiError(
      error instanceof Error ? error.message : "Unknown error occurred",
      0,
      "Network Error"
    );
  }
}

// Example API functions (replace with your actual API endpoints)
export const api = {
  // Example: getUsers: () => apiClient<User[]>('/api/users'),
  // Example: getUser: (id: string) => apiClient<User>(`/api/users/${id}`),
  // Example: createUser: (user: CreateUserRequest) =>
  //   apiClient<User>('/api/users', { method: 'POST', body: JSON.stringify(user) }),
} as const;
