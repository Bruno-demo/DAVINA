import { Request, Response } from "express";
import QuizResponse from "../models/quizResponse.model";
import { determineSkinTypeAndAdvice } from "../utils/skinTypeHelper";
import fs from "fs";
import path from "path";

async function createOrUpdateQuiz(req: Request, res: Response): Promise<void> {
  try {
    const { userId, answers } = req.body;

    if (!userId || !answers) {
      res
        .status(400)
        .json({ message: "userId und Antworten sind erforderlich." });
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
        .json({ message: "Aktualisiert", result: skinType, advice });
      return;
    }

    const newQuiz = new QuizResponse({
      userId,
      answers: parsedAnswers,
      result: skinType,
    });
    await newQuiz.save();

    res.status(201).json({ message: "Gespeichert", result: skinType, advice });
  } catch (err) {
    console.error(" Fehler in createOrUpdateQuiz:", (err as Error).message);
    res.status(500).json({ error: (err as Error).message });
  }
}

async function getQuizByUser(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const quiz = await QuizResponse.findOne({ userId: id });

    if (!quiz) {
      res.status(404).json({ message: "Kein Quiz gefunden." });
      return;
    }

    res.status(200).json(quiz);
  } catch (err) {
    console.error(" Fehler in getQuizByUser:", (err as Error).message);
    res.status(500).json({ error: (err as Error).message });
  }
}

function getQuizQuestions(req: Request, res: Response): void {
  try {
    const filePath = path.join(
      __dirname,
      "../models/mongo/Data/quizQuestions.json"
    );
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    res.status(200).json(data.questions);
  } catch (err) {
    console.error(" Fehler in getQuizQuestions:", (err as Error).message);
    res.status(500).json({ error: "Fragen konnten nicht geladen werden." });
  }
}

export { createOrUpdateQuiz, getQuizByUser, getQuizQuestions };
