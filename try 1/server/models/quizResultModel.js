import { query } from "../config/db.js";

const QuizResultModel = {

    //We create a new quiz result
  async create({ user_id, quiz_id, score, completed_at = 'CURRENT_TIMESTAMP' }) {
    const { rows } = await query(
      "INSERT INTO quiz_results (user_id, quiz_id, score, completed_at) VALUES ($1, $2, $3, $4) RETURNING *",
      [user_id, quiz_id, score, completed_at]
    );
    return rows[0];
  },


  //We find a quiz result by its id
  async findByUserAndQuiz(userId, quizId) {
    const { rows } = await query(
      "SELECT * FROM quiz_results WHERE user_id = $1 AND quiz_id = $2",
      [userId, quizId]
    );
    return rows[0];
  },

  //We find all quiz results for a user
  async getUserResults(userId) {
    const { rows } = await query(
      "SELECT qr.*, q.title as quiz_title FROM quiz_results qr JOIN quizzes q ON qr.quiz_id = q.id WHERE qr.user_id = $1",
      [userId]
    );
    return rows;
  },
  
  //We find all quiz results for a quiz
  async getLeaderboard(limit = 10) {
    const { rows } = await query(
      `SELECT u.id, u.name, u.avatar_url, 
       SUM(qr.score) as total_score, 
       COUNT(qr.id) as quizzes_taken 
       FROM users u 
       JOIN quiz_results qr ON u.id = qr.user_id 
       GROUP BY u.id, u.name, u.avatar_url 
       ORDER BY total_score DESC 
       LIMIT $1`,
      [limit]
    );
    return rows;
  }
};

export default QuizResultModel;