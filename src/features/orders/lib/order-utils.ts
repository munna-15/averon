import type {
  DeliveryArea,
  OrderPricing,
  OrderStatus,
  OrderTimelineEvent,
} from "@/types/order";

export function formatOrderPrice(amount: number): string {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

export function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  const randomPart = crypto
    .randomUUID()
    .replace(/-/g, "")
    .slice(0, 8)
    .toUpperCase();

  return `AV-${year}${month}${day}-${randomPart}`;
}

export function getDeliveryCharge(area: DeliveryArea): number {
  return area === "dhaka" ? 7000 : 12000;
}

export function calculateOrderPricing(
  subtotal: number,
  deliveryArea: DeliveryArea,
  discount = 0,
): OrderPricing {
  const deliveryCharge = getDeliveryCharge(deliveryArea);
  const safeDiscount = Math.max(
    0,
    Math.min(discount, subtotal + deliveryCharge),
  );

  return {
    currency: "BDT",
    subtotal,
    deliveryCharge,
    discount: safeDiscount,
    total: subtotal + deliveryCharge - safeDiscount,
  };
}

export const ORDER_STATUS_DETAILS: Record<
  OrderStatus,
  { label: string; description: string }
> = {
  placed: {
    label: "Order Placed",
    description: "Your order has been successfully received.",
  },
  confirmed: {
    label: "Order Confirmed",
    description: "Your order has been reviewed and confirmed.",
  },
  preparing: {
    label: "Preparing Your Order",
    description: "Your pieces are being prepared for dispatch.",
  },
  dispatched: {
    label: "On Its Way",
    description: "Your order has been handed over for delivery.",
  },
  delivered: {
    label: "Delivered",
    description: "Your order has reached its destination.",
  },
  cancelled: {
    label: "Order Cancelled",
    description: "This order has been cancelled.",
  },
};

export function createInitialOrderTimeline(
  createdAt: string,
): OrderTimelineEvent[] {
  return [
    {
      status: "placed",
      title: ORDER_STATUS_DETAILS.placed.label,
      description: ORDER_STATUS_DETAILS.placed.description,
      createdAt,
    },
  ];
}
