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
}

export enum StatusOrder {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
}
