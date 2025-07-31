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
  createdAt: string;
  updatedAt: string;
}
