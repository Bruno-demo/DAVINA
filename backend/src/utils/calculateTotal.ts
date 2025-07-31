import Product from '../models/productItems';
import { Types } from 'mongoose';

interface OrderedItemInput {
  product_id: string | Types.ObjectId;
  quantity: number;
}

interface ProcessedItem {
  product_id: Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
}

export const calculateTotal = async (ordered_items: OrderedItemInput[]): Promise<{
  total_price: number;
  processedItems: ProcessedItem[];
}> => {
  let total_price = 0;
  const processedItems: ProcessedItem[] = [];

  for (const item of ordered_items) {
    const product = await Product.findById(item.product_id);
    if (!product) throw new Error(`Produkt ${item.product_id} nicht gefunden.`);

    const subtotal = product.price * item.quantity;
    total_price += subtotal;

    processedItems.push({
      product_id: product._id as Types.ObjectId,
      name: product.p_name,
      price: product.price,
      quantity: item.quantity
    });
  }

  return { total_price, processedItems };
};
