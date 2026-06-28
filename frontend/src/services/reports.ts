import { apiRequest } from "../hooks/useApi";
import type { ApiResponse } from "../types/api";

const REPORTS_API_PATH = "/api/reports";

export type ReportFilters = {
  startDate?: string;
  endDate?: string;
};

export type ReportSummary = {
  totalSales: number;
  totalOrders: number;
  startDate: string | null;
  endDate: string | null;
};

function buildReportFiltersUrl(filters: ReportFilters): string {
  const params = new URLSearchParams();

  if (filters.startDate) {
    params.set("startDate", filters.startDate);
  }

  if (filters.endDate) {
    params.set("endDate", filters.endDate);
  }

  const query = params.toString();

  return query ? `${REPORTS_API_PATH}?${query}` : REPORTS_API_PATH;
}

export async function getReport(
  filters: ReportFilters,
): Promise<ApiResponse<ReportSummary>> {
  return apiRequest<ApiResponse<ReportSummary>>(buildReportFiltersUrl(filters));
}
