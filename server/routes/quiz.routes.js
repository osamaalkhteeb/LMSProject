import express from "express"
import { QuizController } from "../controllers/quiz.controller.js"
import { authenticate,authorize } from "../middleware/auth.js"

const router = express.Router()

// Get quiz details
router.get("/:quizId",authenticate,authorize(["student"]),QuizController.getQuiz);

// Submit quiz
router.post("/:quizId/submit",authenticate,authorize(["student"]),QuizController.submitQuiz);

// View results 
router.get("/:quizId/results",authenticate,authorize(["student","instructor"]),QuizController.getResults);

export default router;