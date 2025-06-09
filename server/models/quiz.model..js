import { query } from "../config/db";

const QuizModel = {
  // Get quiz by ID with questions and options
  async getById(quizId) {
    try {
      // Get quiz details
      const {
        rows: [quiz],
      } = await query(
        `SELECT id, title, passing_score, time_limit 
        FROM quizzes WHERE id = $1`,
        [quizId]
      );

      if (!quiz) return null;

      // Get questions
      const {
        rows: [questions],
      } = await query(
        `SELECT id, question_text, question_type, points, order_num
         FROM quiz_questions 
         WHERE quiz_id = $1 
         ORDER BY order_num`,
        [quizId]
      );

      // Get options for each question
      for (const question of questions) {
        const { rows: options } = await query(
          `SELECT id, option_text, order_num 
           FROM quiz_options 
           WHERE question_id = $1 
           ORDER BY order_num`,
          [question.id]
        );
        question.options = options;
      }

      return { ...quiz, questions };
    } catch (error) {
      console.error("Error fetching quiz:", error);
      throw error;
    }
  },

  // Submit and grade quiz attempt
  async gradeAttempt(userId, quizId, answers) {
    try {
      // Validate quiz exists
      const quiz = await this.getById(quizId);
      if (!quiz) throw new Error("Quiz not found");

      // Calculate score
      let score = 0;
      const results = [];

      for (const question of quiz.questions) {
        const userAnswer = answers.find((a) => a.questionId === question.id);
        let IsCorrect = false;

        // For multiple-choice questions
        if (question.question_type === "multiple_choice") {
          const correctOption = question.options.find((o) => o.is_correct);
          IsCorrect = userAnswer?.optionId === correctOption?.id;
        }

        // For true/false questions
        else if (question.question_type === "true_false") {
          IsCorrect = userAnswer?.answerText === question.correct_answer;
        }
        if (IsCorrect) score += question.points;
        results.push({ questionId: question.id, IsCorrect });
      }

      // Calculate percentage score
      const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
      const percentageScore = Math.round((score / totalPoints) * 100);

      // Save attempt
      const {
        rows: [attempt],
      } = await query(
        `INSERT INTO quiz_results 
             (user_id, quiz_id, score, started_at, completed_at) 
             VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
             RETURNING *`,
        [userId, quizId, percentageScore]
      );

      // Save individual answers
      for (const answer of answers) {
        await query(
          `INSERT INTO quiz_answers 
           (result_id, question_id, option_id, answer_text, is_correct)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            attempt.id,
            answer.questionId,
            answer.optionId,
            answer.answerText,
            results.find((r) => r.questionId === answer.questionId)?.isCorrect,
          ]
        );
      }

      return {
        attempt,
        score: percentageScore,
        passed: percentageScore >= quiz.passing_score,
      };
    } catch (error) {
      console.error("Error grading quiz:", error);
      throw error;
    }
  },

  // Get quiz results for a user
  async getResults(userId, quizId) {
    const { rows } = await query(
      `SELECT r.*, 
              q.title as quiz_title,
              q.passing_score
       FROM quiz_results r
       JOIN quizzes q ON r.quiz_id = q.id
       WHERE r.user_id = $1 AND r.quiz_id = $2
       ORDER BY r.completed_at DESC`,
      [userId, quizId]
    );
    return rows;
  },
};

export default QuizModel;