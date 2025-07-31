import mongoose, { Schema, Document, Types, Model } from "mongoose";
import { StatusKorb } from "../enums/status.enum";

export interface IOrderedItem {
  product_id: Types.ObjectId;
  name?: string;
  quantity: number;
  price: number;
}

export interface IWarenkorb extends Document {
  user_id: number;
  ordered_items: IOrderedItem[];
  total_price: number;
  status: StatusKorb;
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

const WarenkorbSchema = new Schema<IWarenkorb>(
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
    status: {
      type: String,
      enum: Object.values(StatusKorb),
      default: StatusKorb.OFFEN,
    },
  },
  {
    collection: "warenkorb",
    timestamps: true,
  }
);

const Warenkorb: Model<IWarenkorb> = mongoose.model<IWarenkorb>(
  "Warenkorb",
  WarenkorbSchema
);

export default Warenkorb;
