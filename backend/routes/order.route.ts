import { Router } from "express";
import {
  createOrder,
  deleteOrder,
  getOrderById,
  getOrders,
  updateOrder,
  updateOrderStatus,
  updatePaymentReceived,
} from "../controllers/order.controller";

const orderRouter = Router();

orderRouter.get("/", getOrders);
orderRouter.get("/:id", getOrderById);
orderRouter.post("/", createOrder);
orderRouter.put("/:id", updateOrder);
orderRouter.patch("/:id/status", updateOrderStatus);
orderRouter.patch("/:id/payment", updatePaymentReceived);
orderRouter.delete("/:id", deleteOrder);

export default orderRouter;
