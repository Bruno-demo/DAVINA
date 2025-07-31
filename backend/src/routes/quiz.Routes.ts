import express from "express";
import * as quizController from "../controllers/quiz.Controller";

const router = express.Router();

router.post("/", quizController.createOrUpdateQuiz);

router.get("/questions", quizController.getQuizQuestions);

router.get("/:id", quizController.getQuizByUser);

export default router;
