export interface OrderedItem {
  product_id: number;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface Order {
  order_id: number;
  user_id: number;
  ordered_items: OrderedItem[];
  total_price: number;
  status: string;
  shipping_method: string;
  shipping_cost: number;
  tax_amount: number;
  order_notes?: string;
  tracking_number?: string;
  coupon_code?: string;
  discount_amount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  address_id?: number;
  user_id?: number;
  label: string;
  first_name: string;
  last_name: string;
  street: string;
  city: string;
  postal_code: string;
  country: string;
  phone?: string;
  is_default: boolean;
}

export interface Review {
  _id: string;
  user_id: number;
  user_name: string;
  product_id: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
}

export interface Coupon {
  _id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_uses: number;
  used_count: number;
  expires_at: string;
  active: boolean;
}

export interface ReturnRequest {
  return_id: number;
  order_id: number;
  user_id: number;
  reason: string;
  status: string;
  admin_notes?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  totalRevenue: number;
  recentOrdersCount: number;
  ordersByStatus: { status: string; count: number }[];
  revenueByMonth: { month: string; revenue: number }[];
  topProducts: { name: string; quantity: number; revenue: number }[];
  lowStockProducts: { _id: string; p_name: string; stock: number; price: number }[];
  paymentMethods: { payment_method: string; count: number }[];
}
