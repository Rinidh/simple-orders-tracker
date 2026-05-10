import { model, Schema, type InferSchemaType } from "mongoose";

const orderStatuses = [
  "Ordered",
  "Preparing",
  "Ready",
  "Out for Delivery",
  "Delivered",
  "Paid",
] as const;

const paymentMethods = [
  "Cash",
  "Mobile Money",
  "Card",
  "Bank Transfer",
  "Other",
] as const;

const orderItemSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);

const orderSchema = new Schema(
  {
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    contact: {
      type: String,
      required: true,
      trim: true,
    },
    addressOrPickupNotes: {
      type: String,
      trim: true,
      default: "",
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator(items: unknown[]): boolean {
          return items.length > 0;
        },
        message: "Order must include at least one item",
      },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    orderDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    orderTime: {
      type: String,
      required: true,
      trim: true,
    },
    deliveryDate: {
      type: Date,
      required: true,
    },
    deliveryTime: {
      type: String,
      required: true,
      trim: true,
    },
    paymentMethod: {
      type: String,
      enum: paymentMethods,
      required: true,
    },
    status: {
      type: String,
      enum: orderStatuses,
      required: true,
      default: "Ordered",
    },
    paymentReceived: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true },
);

orderSchema.pre("validate", function calculateTotalAmount() {
  this.totalAmount = this.items.reduce(
    (total, item) => total + item.quantity * item.price,
    0,
  );
});

export type Order = InferSchemaType<typeof orderSchema>;
export const OrderModel = model("Order", orderSchema);
export { orderStatuses, paymentMethods };
