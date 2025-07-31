import { Request, Response } from 'express';
import ProductItem from '../models/productItems';
import QuizResponse from '../models/quizResponse.model';

export const getRecommendedProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const quiz = await QuizResponse.findOne({ userId });
    if (!quiz) {
      res.status(404).json({ nachricht: 'Kein Quiz gefunden für diesen Benutzer.' });
      return;
    }

    const skinType = quiz.result;

    const products = await ProductItem.find({ skin_typ_target: skinType });

    res.status(200).json({
      hauttyp: skinType,
      empfohleneProdukte: products
    });
  } catch (fehler: any) {
    console.error('Fehler bei getRecommendedProducts:', fehler.message);
    res.status(500).json({ fehler: 'Fehler beim Laden der empfohlenen Produkte.' });
  }
};
