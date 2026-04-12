import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICoupon extends Document {
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount: number;
  max_uses: number;
  used_count: number;
  expires_at: Date;
  active: boolean;
  createdAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    discount_type: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discount_value: {
      type: Number,
      required: true,
      min: 0,
    },
    min_order_amount: {
      type: Number,
      default: 0,
    },
    max_uses: {
      type: Number,
      default: 0, // 0 = unlimited
    },
    used_count: {
      type: Number,
      default: 0,
    },
    expires_at: {
      type: Date,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    collection: "coupons",
    timestamps: true,
  }
);

const Coupon: Model<ICoupon> = mongoose.model<ICoupon>("Coupon", CouponSchema);

export default Coupon;
