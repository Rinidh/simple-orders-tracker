import type { Request, Response } from "express";
import mongoose from "mongoose";
import { OrderModel } from "../models/order.model";
import { parseEnv } from "node:util";

function parseDate(value: unknown): Date | null {
  if (typeof value !== "string") {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function getReport(req: Request, res: Response): Promise<void> {
  const { startDate, endDate } = req.query;
  const match: Record<string, unknown> = {
    status: "Paid",
    paymentReceived: true,
  };

  if (startDate !== undefined) {
    const parsedStart = parseDate(startDate);
    if (!parsedStart) {
      res.status(400).json({
        message: "Invalid startDate",
        errors: ["startDate must be a valid ISO date string"],
      });
      return;
    }
    match.orderDate = {
      ...(match.orderDate as Record<string, unknown>),
      $gte: parsedStart,
    };
  }

  if (endDate !== undefined) {
    const parsedEnd = parseDate(endDate);
    if (!parsedEnd) {
      res.status(400).json({
        message: "Invalid endDate",
        errors: ["endDate must be a valid ISO date string"],
      });
      return;
    }
    match.orderDate = {
      ...(match.orderDate as Record<string, unknown>),
      $lte: parsedEnd,
    };
  }

  try {
    const report = await OrderModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    const summary = report[0] ?? { totalSales: 0, totalOrders: 0 };

    res.status(200).json({
      message: "Report fetched successfully",
      data: {
        ...summary,
        startDate: parseDate(startDate) ?? null,
        endDate: parseDate(endDate) ?? null,
      },
    });
  } catch (error) {
    if (error instanceof mongoose.Error) {
      res.status(500).json({
        message: "Failed to generate report",
      });
      return;
    }

    res.status(500).json({
      message: "Something went wrong while generating the report",
    });
  }
}
