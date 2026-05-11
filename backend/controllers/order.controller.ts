import type { Request, Response } from "express";
import mongoose from "mongoose";
import {
  OrderModel,
  orderStatuses,
  paymentMethods,
} from "../models/order.model";

type OrderItemInput = {
  name?: unknown;
  quantity?: unknown;
  price?: unknown;
};

type OrderRequestBody = {
  customerName?: unknown;
  contact?: unknown;
  addressOrPickupNotes?: unknown;
  items?: unknown;
  orderDate?: unknown;
  orderTime?: unknown;
  deliveryDate?: unknown;
  deliveryTime?: unknown;
  paymentMethod?: unknown;
  status?: unknown;
  paymentReceived?: unknown;
};

type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; errors: string[] };

type ValidatedOrderInput = {
  customerName: string;
  contact: string;
  addressOrPickupNotes?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  orderDate: Date;
  orderTime: string;
  deliveryDate: Date;
  deliveryTime: string;
  paymentMethod: (typeof paymentMethods)[number];
  status?: (typeof orderStatuses)[number];
  paymentReceived?: boolean;
};

const editableOrderFields = [
  "customerName",
  "contact",
  "addressOrPickupNotes",
  "items",
  "orderDate",
  "orderTime",
  "deliveryDate",
  "deliveryTime",
  "paymentMethod",
  "status",
  "paymentReceived",
] as const;

function sendServerError(res: Response, error: unknown): void {
  if (error instanceof mongoose.Error.ValidationError) {
    res.status(400).json({
      message: "Order validation failed",
      errors: Object.values(error.errors).map(
        (fieldError) => fieldError.message,
      ),
    });
    return;
  }

  res.status(500).json({
    message: "Something went wrong while processing the order request",
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readRequiredString(
  body: Record<string, unknown>,
  field: string,
  errors: string[],
): string {
  const value = body[field];

  if (typeof value !== "string" || value.trim().length === 0) {
    errors.push(`${field} is required`);
    return "";
  }

  return value.trim();
}

function readOptionalString(
  body: Record<string, unknown>,
  field: string,
  errors: string[],
): string | undefined {
  const value = body[field];

  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== "string") {
    errors.push(`${field} must be a string`);
    return undefined;
  }

  return value.trim();
}

function readRequiredDate(
  body: Record<string, unknown>,
  field: string,
  errors: string[],
): Date {
  const value = body[field];

  if (typeof value !== "string" && !(value instanceof Date)) {
    errors.push(`${field} is required`);
    return new Date(Number.NaN);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    errors.push(`${field} must be a valid date`);
  }

  return date;
}

function validateItems(
  value: unknown,
  errors: string[],
): ValidatedOrderInput["items"] {
  if (!Array.isArray(value) || value.length === 0) {
    errors.push("items must include at least one item");
    return [];
  }

  return value.map((item: OrderItemInput, index) => {
    const itemPrefix = `items[${index}]`;

    if (!isRecord(item)) {
      errors.push(`${itemPrefix} must be an object`);
      return { name: "", quantity: 0, price: 0 };
    }

    const name = readRequiredString(item, "name", errors);
    const quantity = Number(item.quantity);
    const price = Number(item.price);

    if (!Number.isFinite(quantity) || quantity < 1) {
      errors.push(`${itemPrefix}.quantity must be at least 1`);
    }

    if (!Number.isFinite(price) || price < 0) {
      errors.push(`${itemPrefix}.price must be at least 0`);
    }

    return { name, quantity, price };
  });
}

function validateOrderInput(
  body: OrderRequestBody,
  required: boolean,
): ValidationResult<Partial<ValidatedOrderInput>> {
  if (!isRecord(body)) {
    return { ok: false, errors: ["Request body must be an object"] };
  }

  const errors: string[] = [];
  const value: Partial<ValidatedOrderInput> = {};

  if (required || body.customerName !== undefined) {
    value.customerName = readRequiredString(body, "customerName", errors);
  }

  if (required || body.contact !== undefined) {
    value.contact = readRequiredString(body, "contact", errors);
  }

  if (required || body.items !== undefined) {
    value.items = validateItems(body.items, errors);
  }

  if (required || body.orderDate !== undefined) {
    value.orderDate = readRequiredDate(body, "orderDate", errors);
  }

  if (required || body.orderTime !== undefined) {
    value.orderTime = readRequiredString(body, "orderTime", errors);
  }

  if (required || body.deliveryDate !== undefined) {
    value.deliveryDate = readRequiredDate(body, "deliveryDate", errors);
  }

  if (required || body.deliveryTime !== undefined) {
    value.deliveryTime = readRequiredString(body, "deliveryTime", errors);
  }

  if (required || body.paymentMethod !== undefined) {
    const paymentMethod = readRequiredString(body, "paymentMethod", errors);

    if (
      !paymentMethods.includes(paymentMethod as (typeof paymentMethods)[number])
    ) {
      errors.push(`paymentMethod must be one of: ${paymentMethods.join(", ")}`);
    } else {
      value.paymentMethod = paymentMethod as (typeof paymentMethods)[number];
    }
  }

  const addressOrPickupNotes = readOptionalString(
    body,
    "addressOrPickupNotes",
    errors,
  );
  if (addressOrPickupNotes !== undefined) {
    value.addressOrPickupNotes = addressOrPickupNotes;
  }

  if (body.status !== undefined) {
    if (typeof body.status !== "string") {
      errors.push("status must be a string");
    } else if (
      !orderStatuses.includes(body.status as (typeof orderStatuses)[number])
    ) {
      errors.push(`status must be one of: ${orderStatuses.join(", ")}`);
    } else {
      value.status = body.status as (typeof orderStatuses)[number];
    }
  }

  if (body.paymentReceived !== undefined) {
    if (typeof body.paymentReceived !== "boolean") {
      errors.push("paymentReceived must be a boolean");
    } else {
      value.paymentReceived = body.paymentReceived;
    }
  }

  if (!required && Object.keys(value).length === 0) {
    errors.push(
      `Provide at least one field to update: ${editableOrderFields.join(", ")}`,
    );
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, value };
}

function isValidOrderId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

function getRouteParam(value: string | string[] | undefined): string | null {
  return typeof value === "string" ? value : null;
}

export async function createOrder(req: Request, res: Response): Promise<void> {
  const validation = validateOrderInput(req.body, true);

  if (!validation.ok) {
    res
      .status(400)
      .json({ message: "Invalid order data", errors: validation.errors });
    return;
  }

  try {
    const order = await OrderModel.create(validation.value);

    res.status(201).json({
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    sendServerError(res, error);
  }
}

export async function getOrders(req: Request, res: Response): Promise<void> {
  const filter: Record<string, unknown> = {};
  const { status, paymentReceived, customerName, startDate, endDate } =
    req.query;

  if (typeof status === "string") {
    filter.status = status;
  }

  if (paymentReceived === "true" || paymentReceived === "false") {
    filter.paymentReceived = paymentReceived === "true";
  }

  if (typeof customerName === "string" && customerName.trim().length > 0) {
    filter.customerName = { $regex: customerName.trim(), $options: "i" };
  }

  if (typeof startDate === "string" || typeof endDate === "string") {
    const orderDate: Record<string, Date> = {};

    if (typeof startDate === "string") {
      const parsedStart = new Date(startDate);
      if (!Number.isNaN(parsedStart.getTime())) {
        orderDate.$gte = parsedStart;
      }
    }

    if (typeof endDate === "string") {
      const parsedEnd = new Date(endDate);
      if (!Number.isNaN(parsedEnd.getTime())) {
        orderDate.$lte = parsedEnd;
      }
    }

    if (Object.keys(orderDate).length > 0) {
      filter.orderDate = orderDate;
    }
  }

  try {
    const orders = await OrderModel.find(filter).sort({
      orderDate: -1,
      createdAt: -1,
    });

    res.status(200).json({
      message: "Orders fetched successfully",
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    sendServerError(res, error);
  }
}

export async function getOrderById(req: Request, res: Response): Promise<void> {
  const id = getRouteParam(req.params.id);

  if (!id || !isValidOrderId(id)) {
    res.status(400).json({ message: "Invalid order id" });
    return;
  }

  try {
    const order = await OrderModel.findById(id);

    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    res.status(200).json({
      message: "Order fetched successfully",
      data: order,
    });
  } catch (error) {
    sendServerError(res, error);
  }
}

export async function updateOrder(req: Request, res: Response): Promise<void> {
  const id = getRouteParam(req.params.id);

  if (!id || !isValidOrderId(id)) {
    res.status(400).json({ message: "Invalid order id" });
    return;
  }

  const validation = validateOrderInput(req.body, false);

  if (!validation.ok) {
    res
      .status(400)
      .json({ message: "Invalid order data", errors: validation.errors });
    return;
  }

  try {
    const order = await OrderModel.findById(id);

    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    order.set(validation.value);
    await order.save();

    res.status(200).json({
      message: "Order updated successfully",
      data: order,
    });
  } catch (error) {
    sendServerError(res, error);
  }
}

export async function updateOrderStatus(
  req: Request,
  res: Response,
): Promise<void> {
  const id = getRouteParam(req.params.id);
  const { status } = req.body as { status?: unknown };

  if (!id || !isValidOrderId(id)) {
    res.status(400).json({ message: "Invalid order id" });
    return;
  }

  if (typeof status !== "string" || !orderStatuses.includes(status as never)) {
    res.status(400).json({
      message: "Invalid status",
      errors: [`status must be one of: ${orderStatuses.join(", ")}`],
    });
    return;
  }

  try {
    const order = await OrderModel.findByIdAndUpdate(
      id,
      { status },
      { returnDocument: "after", runValidators: true },
    );

    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    res.status(200).json({
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    sendServerError(res, error);
  }
}

export async function updatePaymentReceived(
  req: Request,
  res: Response,
): Promise<void> {
  const id = getRouteParam(req.params.id);
  const { paymentReceived } = req.body as { paymentReceived?: unknown };

  if (!id || !isValidOrderId(id)) {
    res.status(400).json({ message: "Invalid order id" });
    return;
  }

  if (typeof paymentReceived !== "boolean") {
    res.status(400).json({
      message: "Invalid payment data",
      errors: ["paymentReceived must be a boolean"],
    });
    return;
  }

  try {
    const order = await OrderModel.findByIdAndUpdate(
      id,
      { paymentReceived },
      { returnDocument: "after", runValidators: true },
    );

    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    res.status(200).json({
      message: "Order payment status updated successfully",
      data: order,
    });
  } catch (error) {
    sendServerError(res, error);
  }
}

export async function deleteOrder(req: Request, res: Response): Promise<void> {
  const id = getRouteParam(req.params.id);

  if (!id || !isValidOrderId(id)) {
    res.status(400).json({ message: "Invalid order id" });
    return;
  }

  try {
    const order = await OrderModel.findByIdAndDelete(id);

    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    res.status(200).json({
      message: "Order deleted successfully",
      data: order,
    });
  } catch (error) {
    sendServerError(res, error);
  }
}
