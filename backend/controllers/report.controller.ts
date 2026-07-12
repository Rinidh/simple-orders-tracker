import type { Request, Response } from "express";
import { OrderModel } from "../models/order.model";
import { ValidationError } from "../errors/validation-error";

type DailySalesPoint = {
  date: string;
  totalSales: number;
  totalOrders: number;
};

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function parseDate(value: unknown): Date | null {
  if (typeof value !== "string") {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function eachDateInRange(
  startDate: Date | null,
  endDate: Date | null,
): string[] {
  if (!startDate || !endDate || startDate > endDate) {
    return [];
  }

  const dates: string[] = [];

  for (
    let current = new Date(startDate);
    current <= endDate;
    current = new Date(current.getTime() + DAY_IN_MS)
  ) {
    dates.push(toDateKey(current));
  }

  return dates;
}

function isCompletedOrder(order: { status: string }): boolean {
  return order.status === "Delivered" || order.status === "Paid";
}

function isPaidSalesOrder(order: {
  paymentReceived: boolean;
  status: string;
}): boolean {
  return order.status === "Paid" && order.paymentReceived;
}

export async function getReport(req: Request, res: Response): Promise<void> {
  const { startDate, endDate } = req.query;
  const match: Record<string, unknown> = {};
  const parsedStart = parseDate(startDate);
  const parsedEnd = parseDate(endDate);

  if (startDate !== undefined) {
    if (!parsedStart) {
      throw new ValidationError("Invalid startDate", [
        "startDate must be a valid ISO date string",
      ]);
    }
    match.orderDate = {
      ...(match.orderDate as Record<string, unknown>),
      $gte: parsedStart,
    };
  }

  if (endDate !== undefined) {
    if (!parsedEnd) {
      throw new ValidationError("Invalid endDate", [
        "endDate must be a valid ISO date string",
      ]);
    }
    match.orderDate = {
      ...(match.orderDate as Record<string, unknown>),
      $lte: parsedEnd,
    };
  }

  const orders = await OrderModel.find(match)
    .select("orderDate paymentReceived status totalAmount")
    .lean();

  const dailySalesByDate = new Map<string, DailySalesPoint>();

  for (const date of eachDateInRange(parsedStart, parsedEnd)) {
    dailySalesByDate.set(date, {
      date,
      totalOrders: 0,
      totalSales: 0,
    });
  }

  let completedOrders = 0;
  let outstandingBalance = 0;
  let totalSales = 0;

  for (const order of orders) {
    if (isCompletedOrder(order)) {
      completedOrders += 1;
    }

    if (!order.paymentReceived) {
      outstandingBalance += order.totalAmount;
    }

    if (!isPaidSalesOrder(order)) {
      continue;
    }

    totalSales += order.totalAmount;

    const date = toDateKey(order.orderDate);
    const currentPoint =
      dailySalesByDate.get(date) ??
      ({
        date,
        totalOrders: 0,
        totalSales: 0,
      } satisfies DailySalesPoint);

    dailySalesByDate.set(date, {
      ...currentPoint,
      totalOrders: currentPoint.totalOrders + 1,
      totalSales: currentPoint.totalSales + order.totalAmount,
    });
  }

  const dailySales = [...dailySalesByDate.values()].sort((left, right) =>
    left.date.localeCompare(right.date),
  );

  res.status(200).json({
    message: "Report fetched successfully",
    data: {
      completedOrders,
      dailySales,
      endDate: parsedEnd,
      outstandingBalance,
      startDate: parsedStart,
      totalOrders: orders.length,
      totalSales,
    },
  });
}
