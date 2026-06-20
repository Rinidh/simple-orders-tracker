export type OrderStatus =
  | "Ordered"
  | "Preparing"
  | "Ready"
  | "Out for Delivery"
  | "Delivered"
  | "Paid";

export type PaymentMethod =
  | "Cash"
  | "Mobile Money"
  | "Card"
  | "Bank Transfer"
  | "Other";

export type OrderItem = {
  name: string;
  quantity: number;
  price: number;
};

export type Order = {
  customerName: string;
  contact: string;
  addressOrPickupNotes: string;
  items: OrderItem[];
  totalAmount: number;
  orderDate: string;
  orderTime: string;
  deliveryDate: string;
  deliveryTime: string;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  paymentReceived: boolean;
};

export type OrderFilters = {
  status?: OrderStatus;
  paymentReceived?: boolean;
  customerName?: string;
  startDate?: string;
  endDate?: string;
};

export type CreateOrderPayload = {
  customerName: string;
  contact: string;
  addressOrPickupNotes?: string;
  items: OrderItem[];
  orderDate: string;
  orderTime: string;
  deliveryDate: string;
  deliveryTime: string;
  paymentMethod: PaymentMethod;
  status?: OrderStatus;
  paymentReceived?: boolean;
};

export type UpdateOrderPayload = Partial<CreateOrderPayload>;
