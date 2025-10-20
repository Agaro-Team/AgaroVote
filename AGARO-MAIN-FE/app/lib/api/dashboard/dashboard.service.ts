/**
 * Dashboard API Service
 *
 * Handles all dashboard-related API requests
 */
import { agaroApi } from '../agaro.api.client';
import type { GetDashboardSummaryResponse } from './dashboard.interface';

export const dashboardService = {
  /**
   * Get dashboard summary with analytics and statistics
   *
   * @returns Dashboard summary data
   */
  async getDashboardSummary(): Promise<GetDashboardSummaryResponse> {
    const response = await agaroApi.get<GetDashboardSummaryResponse>('/v1/dashboards/summary');
    return response;
  },
};
