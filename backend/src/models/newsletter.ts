import mongoose, { Schema, Document, Model } from "mongoose";

export interface INewsletter extends Document {
  email: string;
  subscribed: boolean;
  subscribed_at: Date;
  unsubscribed_at?: Date;
}

const NewsletterSchema = new Schema<INewsletter>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    subscribed: {
      type: Boolean,
      default: true,
    },
    subscribed_at: {
      type: Date,
      default: Date.now,
    },
    unsubscribed_at: {
      type: Date,
      default: null,
    },
  },
  {
    collection: "newsletters",
    timestamps: true,
  }
);

const Newsletter: Model<INewsletter> = mongoose.model<INewsletter>("Newsletter", NewsletterSchema);

export default Newsletter;
