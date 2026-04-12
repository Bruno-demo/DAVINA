export enum StatusCart {
  OPEN = "Open",
  ORDERED = "Ordered",
  CANCELLED = "Cancelled",
  EXPIRED = "Expired",
}

export enum StatusProduct {
  AVAILABLE = "Available",
  SOLD_OUT = "Sold Out",
}

export enum StatusPayment {
  PENDING = "pending",
  PAID = "paid",
  FAILED = "failed",
  REFUNDED = "refunded",
}

export enum StatusOrder {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
  RETURNED = "returned",
}

export enum StatusReturn {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  COMPLETED = "completed",
}

export enum ShippingMethod {
  STANDARD = "standard",
  EXPRESS = "express",
  OVERNIGHT = "overnight",
  FREE = "free",
}

export const SHIPPING_COSTS: Record<ShippingMethod, number> = {
  [ShippingMethod.STANDARD]: 4.99,
  [ShippingMethod.EXPRESS]: 9.99,
  [ShippingMethod.OVERNIGHT]: 19.99,
  [ShippingMethod.FREE]: 0,
};

export const TAX_RATE = 0.19; // 19% VAT
