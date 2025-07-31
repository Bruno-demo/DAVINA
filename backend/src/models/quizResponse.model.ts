import mongoose, { Schema, Document, Model } from "mongoose";

export type SkinType = "fettig" | "trocken" | "normal" | "misch";

export interface IQuizResponse extends Document {
  userId: string;
  answers: Map<string, string>;
  result: SkinType;
  createdAt: Date;
}

const quizResponseSchema: Schema<IQuizResponse> = new Schema({
  userId: {
    type: String,
    required: true,
  },
  answers: {
    type: Map,
    of: String,
    required: true,
  },
  result: {
    type: String,
    enum: ["fettig", "trocken", "normal", "misch"],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const QuizResponse: Model<IQuizResponse> = mongoose.model<IQuizResponse>(
  "QuizResponse",
  quizResponseSchema
);

export default QuizResponse;
