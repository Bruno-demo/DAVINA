import { Request, Response } from 'express';
import ProductItem from '../models/productItems';
import QuizResponse from '../models/quizResponse.model';

export const getRecommendedProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const quiz = await QuizResponse.findOne({ userId });
    if (!quiz) {
      res.status(404).json({ message: 'No quiz found for this user.' });
      return;
    }

    const skinType = quiz.result;

    const products = await ProductItem.find({ skin_typ_target: skinType });

    res.status(200).json({
      skinType: skinType,
      recommendedProducts: products
    });
  } catch (error: any) {
    console.error('Error in getRecommendedProducts:', error.message);
    res.status(500).json({ error: 'Error loading recommended products.' });
  }
};
