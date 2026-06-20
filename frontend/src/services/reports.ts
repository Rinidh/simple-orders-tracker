import type { ApiError, ApiResponse } from "../types/api";

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

async function request<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = (await response.json()) as T | ApiError;

  if (!response.ok) {
    const apiError = data as ApiError;
    throw new Error(apiError.errors?.join(", ") ?? apiError.message);
  }

  return data as T;
}

export async function getReport(
  filters: ReportFilters,
): Promise<ApiResponse<ReportSummary>> {
  return request<ApiResponse<ReportSummary>>(buildReportFiltersUrl(filters));
}
