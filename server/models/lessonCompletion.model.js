import { query } from "../config/db";

const LessonCompletionModel = {
  async markComplete(user_id, lesson_id) {
    try {
      const { rows } = await query(
        `INSERT INTO lesson_completions (user_id, lesson_id)
         VALUES ($1, $2)
         ON CONFLICT (user_id, lesson_id) DO NOTHING
         RETURNING *`,
        [user_id, lesson_id]
      );
      return rows[0];
    } catch (error) {
      console.error("Error marking lesson complete:", error);
      throw error;
    }
  },

  async isCompleted(user_id, lesson_id) {
    const { rows } = await query(
      `SELECT 1 FROM lesson_completions 
       WHERE user_id = $1 AND lesson_id = $2`,
      [user_id, lesson_id]
    );
    return rows.length > 0;
  },
};

export default LessonCompletionModel;
