import QuizResultModel from "../models/quizResultModel.js";
import BadgeModel from "../models/badgeModel.js";

const QuizController = {

    // Submit a quiz result
  async submitQuizResult(req, res, next) {
    try {
      const { quiz_id, score } = req.body;
      const user_id = req.user.id;
      
      if (!quiz_id || score === undefined) {
        throw new Error("Quiz ID and score are required");
      }
      
      const result = await QuizResultModel.create({ user_id, quiz_id, score });
      
      // Check if user qualifies for any badges based on quiz performance
      // This is a simple example - you'd have more complex logic in a real app
      if (score >= 90) {
        // Award "Quiz Master" badge if it exists
        const quizMasterBadge = await BadgeModel.findById(1); // Assuming ID 1 is Quiz Master badge
        if (quizMasterBadge) {
          await BadgeModel.awardBadgeToUser(user_id, quizMasterBadge.id);
        }
      }
      
      res.status(201).json({ success: true, result });
    } catch (error) {
      next(error);
    }
  },

  // Get all quiz results for a user
  async getUserQuizResults(req, res, next) {
    try {
      const userId = req.params.userId || req.user.id;
      const results = await QuizResultModel.getUserResults(userId);
      res.json({ success: true, results });
    } catch (error) {
      next(error);
    }
  },

  // Get leaderboard of top quiz scorers
  async getLeaderboard(req, res, next) {
    try {
      const limit = req.query.limit || 10;
      const leaderboard = await QuizResultModel.getLeaderboard(limit);
      res.json({ success: true, leaderboard });
    } catch (error) {
      next(error);
    }
  }
};

export default QuizController;