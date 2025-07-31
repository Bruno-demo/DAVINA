import mongoose, { Schema, Document, Model } from "mongoose";

export interface IQuizResponse extends Document {
  userId: string;
  answers: Map<string, string>;
  result: string;
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
