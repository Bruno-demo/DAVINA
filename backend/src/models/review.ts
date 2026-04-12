import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReview extends Document {
  user_id: number;
  user_name: string;
  product_id: mongoose.Types.ObjectId;
  rating: number;
  title: string;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    user_id: {
      type: Number,
      required: true,
      index: true,
    },
    user_name: {
      type: String,
      required: true,
    },
    product_id: {
      type: Schema.Types.ObjectId,
      ref: "ProductItem",
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    comment: {
      type: String,
      required: true,
      maxlength: 2000,
    },
  },
  {
    collection: "reviews",
    timestamps: true,
  }
);

// One review per user per product
ReviewSchema.index({ user_id: 1, product_id: 1 }, { unique: true });

const Review: Model<IReview> = mongoose.model<IReview>("Review", ReviewSchema);

export default Review;
