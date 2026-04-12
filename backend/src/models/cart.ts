import mongoose, { Schema, Document, Types, Model } from "mongoose";
import { StatusCart } from "../enums/status.enum";

export interface IOrderedItem {
  product_id: Types.ObjectId;
  name?: string;
  quantity: number;
  price: number;
}

export interface ICart extends Document {
  user_id: number;
  ordered_items: IOrderedItem[];
  total_price: number;
  coupon_code?: string;
  discount_amount: number;
  status: StatusCart;
  recovery_email_sent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OrderedItemSchema = new Schema<IOrderedItem>(
  {
    product_id: {
      type: Schema.Types.ObjectId,
      ref: "ProductItem",
      required: true,
    },
    name: {
      type: String,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    price: {
      type: Number,
    },
  },
  { _id: false }
);

const CartSchema = new Schema(
  {
    user_id: {
      type: Number,
      required: true,
      index: true,
    },
    ordered_items: {
      type: [OrderedItemSchema],
      required: true,
      default: [],
    },
    total_price: {
      type: Number,
      required: true,
      default: 0,
    },
    coupon_code: {
      type: String,
      default: null,
    },
    discount_amount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: Object.values(StatusCart),
      default: StatusCart.OPEN,
    },
    recovery_email_sent: {
      type: Boolean,
      default: false,
    },
  },
  {
    collection: "cart",
    timestamps: true,
  }
);

const Cart: Model<ICart> = mongoose.model<ICart>(
  "Cart",
  CartSchema
);

export default Cart;
