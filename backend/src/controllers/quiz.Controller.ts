import { Request, Response } from "express";
import QuizResponse from "../models/quizResponse.model";
import { determineSkinTypeAndAdvice } from "../utils/skinTypeHelper";
import quizQuestions from "../models/mongo/Data/quizQuestions.json";

async function createOrUpdateQuiz(req: Request, res: Response): Promise<void> {
  try {
    const { userId, answers } = req.body;

    if (!userId || !answers) {
      res
        .status(400)
        .json({ message: "userId and answers are required." });
      return;
    }

    const parsedAnswers =
      answers instanceof Map ? Object.fromEntries(answers) : answers;

    const { skinType, advice } = determineSkinTypeAndAdvice(parsedAnswers);

    const existing = await QuizResponse.findOne({ userId });

    if (existing) {
      existing.answers = parsedAnswers;
      existing.result = skinType;
      await existing.save();

      res
        .status(200)
        .json({ message: "Updated", result: skinType, advice });
      return;
    }

    const newQuiz = new QuizResponse({
      userId,
      answers: parsedAnswers,
      result: skinType,
    });
    await newQuiz.save();

    res.status(201).json({ message: "Saved", result: skinType, advice });
  } catch (err) {
    console.error("Error in createOrUpdateQuiz:", (err as Error).message);
    res.status(500).json({ error: (err as Error).message });
  }
}

async function getQuizByUser(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const quiz = await QuizResponse.findOne({ userId: id });

    if (!quiz) {
      res.status(404).json({ message: "Quiz not found." });
      return;
    }

    res.status(200).json(quiz);
  } catch (err) {
    console.error("Error in getQuizByUser:", (err as Error).message);
    res.status(500).json({ error: (err as Error).message });
  }
}

function getQuizQuestions(_req: Request, res: Response): void {
  try {
    res.status(200).json(quizQuestions.questions);
  } catch (err) {
    console.error("Error in getQuizQuestions:", (err as Error).message);
    res.status(500).json({ error: "Questions could not be loaded." });
  }
}

export { createOrUpdateQuiz, getQuizByUser, getQuizQuestions };
