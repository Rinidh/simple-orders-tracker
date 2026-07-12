import { useCallback, useEffect, useMemo, useState } from "react";
import { ApiRequestError } from "./useApi";
import {
  getReport,
  type DailySalesPoint,
  type ReportFilters,
  type ReportSummary,
} from "../services/reports";

export type ReportMetrics = {
  completedOrders: number;
  dailySales: DailySalesPoint[];
  outstandingBalance: number;
  totalOrders: number;
  totalSales: number;
};

export type UseReportsOptions = {
  initialEndDate?: string;
  initialStartDate?: string;
};

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function normalizeError(error: unknown): ApiRequestError {
  if (error instanceof ApiRequestError) {
    return error;
  }

  if (error instanceof Error) {
    return new ApiRequestError(error.message);
  }

  return new ApiRequestError("Unable to load reports. Please try again.");
}

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getDefaultDateRange(): Required<ReportFilters> {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - 6 * DAY_IN_MS);

  return {
    endDate: toDateInputValue(endDate),
    startDate: toDateInputValue(startDate),
  };
}

function getReportMetrics(report: ReportSummary | null): ReportMetrics {
  return {
    completedOrders: report?.completedOrders ?? 0,
    dailySales: report?.dailySales ?? [],
    outstandingBalance: report?.outstandingBalance ?? 0,
    totalOrders: report?.totalOrders ?? 0,
    totalSales: report?.totalSales ?? 0,
  };
}

export function useReports(options: UseReportsOptions = {}) {
  const defaultDateRange = useMemo(() => getDefaultDateRange(), []);
  const [startDate, setStartDate] = useState(
    options.initialStartDate ?? defaultDateRange.startDate,
  );
  const [endDate, setEndDate] = useState(
    options.initialEndDate ?? defaultDateRange.endDate,
  );
  const [report, setReport] = useState<ReportSummary | null>(null);
  const [error, setError] = useState<ApiRequestError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshIndex, setRefreshIndex] = useState(0);

  const filters = useMemo<ReportFilters>(
    () => ({
      endDate,
      startDate,
    }),
    [endDate, startDate],
  );

  const metrics = useMemo(() => getReportMetrics(report), [report]);

  const refresh = useCallback(() => {
    setRefreshIndex((currentIndex) => currentIndex + 1);
  }, []);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const updateDateRange = useCallback((nextFilters: ReportFilters) => {
    setStartDate(nextFilters.startDate ?? "");
    setEndDate(nextFilters.endDate ?? "");
  }, []);

  useEffect(() => {
    let isCurrentRequest = true;

    async function fetchReport() {
      setIsLoading(true);
      setError(null);

      try {
        const reportResponse = await getReport(filters);

        if (!isCurrentRequest) {
          return;
        }

        setReport(reportResponse.data);
      } catch (caughtError) {
        if (!isCurrentRequest) {
          return;
        }

        setError(normalizeError(caughtError));
      } finally {
        if (isCurrentRequest) {
          setIsLoading(false);
        }
      }
    }

    fetchReport();

    return () => {
      isCurrentRequest = false;
    };
  }, [filters, refreshIndex]);

  return {
    completedOrders: metrics.completedOrders,
    dailySales: metrics.dailySales,
    endDate,
    error,
    filters,
    isLoading,
    metrics,
    outstandingBalance: metrics.outstandingBalance,
    refresh,
    report,
    resetError,
    setEndDate,
    setStartDate,
    startDate,
    totalOrders: metrics.totalOrders,
    totalSales: metrics.totalSales,
    updateDateRange,
  };
}
