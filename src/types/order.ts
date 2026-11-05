export type OrderStatus =
  | "placed"
  | "confirmed"
  | "preparing"
  | "dispatched"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "cod" | "bkash" | "nagad" | "bank";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type DeliveryArea = "dhaka" | "outside";

export interface OrderCustomer {
  fullName: string;
  phone: string;
  email?: string;
}

export interface OrderAddress {
  district: string;
  area: string;
  address: string;
  deliveryArea: DeliveryArea;
}

export interface OrderItem {
  productId: string;
  slug: string;
  name: string;
  image: string;
  color: string;
  size: string;
  sku?: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderPricing {
  currency: "BDT";
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  total: number;
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  title: string;
  description?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;

  customer: OrderCustomer;
  address: OrderAddress;

  items: OrderItem[];
  pricing: OrderPricing;

  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;

  status: OrderStatus;
  timeline: OrderTimelineEvent[];

  customerNote?: string;

  createdAt: string;
  updatedAt: string;
}
