/**
 * Dashboard API Service - Server Side
 *
 * Server-compatible API functions for use in loaders/actions
 */
import type { GetDashboardSummaryResponse } from './dashboard.interface';

const API_BASE_URL = process.env.VITE_AGARO_VOTE_API_ENTRYPOINT || 'http://localhost:3000/api';

/**
 * Fetch dashboard summary (server-side)
 *
 * @param token - Auth token from cookie
 * @returns Dashboard summary data
 */
export async function fetchDashboardSummary(token: string): Promise<GetDashboardSummaryResponse> {
  const response = await fetch(`${API_BASE_URL}/v1/dashboards/summary`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch dashboard summary: ${response.statusText}`);
  }

  return response.json();
}
