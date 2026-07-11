import { useCallback, useEffect, useMemo, useState } from "react";
import { ApiRequestError } from "./useApi";
import { listOrders } from "../services/orders";
import { getReport, type ReportFilters, type ReportSummary } from "../services/reports";
import type { Order } from "../types/orders";

export type DailySalesPoint = {
  date: string;
  totalSales: number;
  totalOrders: number;
};

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

function parseDateInputValue(value?: string | null): Date | null {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.slice(0, 10).split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  const date = new Date(year, month - 1, day);

  return Number.isNaN(date.getTime()) ? null : date;
}

function eachDateInRange(startDate?: string, endDate?: string): string[] {
  const parsedStartDate = parseDateInputValue(startDate);
  const parsedEndDate = parseDateInputValue(endDate);

  if (!parsedStartDate || !parsedEndDate || parsedStartDate > parsedEndDate) {
    return [];
  }

  const dates: string[] = [];

  for (
    let cursor = parsedStartDate;
    cursor <= parsedEndDate;
    cursor = new Date(cursor.getTime() + DAY_IN_MS)
  ) {
    dates.push(toDateInputValue(cursor));
  }

  return dates;
}

function isCompletedOrder(order: Order): boolean {
  return order.status === "Delivered" || order.status === "Paid";
}

function isPaidSalesOrder(order: Order): boolean {
  return order.status === "Paid" && order.paymentReceived;
}

function getOrderDateKey(order: Order): string {
  return order.orderDate.slice(0, 10);
}

function buildDailySales(orders: Order[], filters: ReportFilters): DailySalesPoint[] {
  const totalsByDate = new Map<string, DailySalesPoint>();

  for (const date of eachDateInRange(filters.startDate, filters.endDate)) {
    totalsByDate.set(date, {
      date,
      totalOrders: 0,
      totalSales: 0,
    });
  }

  for (const order of orders) {
    if (!isPaidSalesOrder(order)) {
      continue;
    }

    const date = getOrderDateKey(order);
    const currentPoint =
      totalsByDate.get(date) ??
      ({
        date,
        totalOrders: 0,
        totalSales: 0,
      } satisfies DailySalesPoint);

    totalsByDate.set(date, {
      ...currentPoint,
      totalOrders: currentPoint.totalOrders + 1,
      totalSales: currentPoint.totalSales + order.totalAmount,
    });
  }

  return [...totalsByDate.values()].sort((left, right) =>
    left.date.localeCompare(right.date),
  );
}

function calculateMetrics(
  report: ReportSummary | null,
  orders: Order[],
  filters: ReportFilters,
): ReportMetrics {
  return {
    completedOrders: orders.filter(isCompletedOrder).length,
    dailySales: buildDailySales(orders, filters),
    outstandingBalance: orders
      .filter((order) => !order.paymentReceived)
      .reduce((total, order) => total + order.totalAmount, 0),
    totalOrders: orders.length,
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
  const [orders, setOrders] = useState<Order[]>([]);
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

  const metrics = useMemo(
    () => calculateMetrics(report, orders, filters),
    [filters, orders, report],
  );

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
        const [reportResponse, ordersResponse] = await Promise.all([
          getReport(filters),
          listOrders({
            endDate: filters.endDate,
            startDate: filters.startDate,
          }),
        ]);

        if (!isCurrentRequest) {
          return;
        }

        setReport(reportResponse.data);
        setOrders(ordersResponse.data);
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
    orders,
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
