import { Router } from "express";
import QuizController from "../controllers/quizController.js";
import { authenticate } from "../middlewares/auth.js";

const router = Router();

router.post("/submit", authenticate, QuizController.submitQuizResult); // Submit quiz result
router.get("/results/:userId?", authenticate, QuizController.getUserQuizResults); // Get quiz results for a user
router.get("/leaderboard", QuizController.getLeaderboard); // Get leaderboard

export default router;