import QuizModel from "../models/quiz.model.js";
import EnrollmentModel from "../models/enrollment.model.js";
import { createResponse } from "../utils/helper.js";
import { HTTP_STATUS } from "../config/constants.js";

export const QuizController = {
  // Get quiz details
  async getQuiz(req, res) {
    try {
      const quiz = await QuizModel.getById(req.params.quiz_id);
      if (!quiz) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json(createResponse(false, null, "Quiz not found"));
      }
      res.json(true, "Quiz retrieved successfully");
    } catch (error) {
      res
        .status(HTTP_STATUS.SERVER_ERROR)
        .json(createResponse(false, "Failed to fetch quiz"));
    }
  },

  // Submit quiz attempt
  async submitQuiz(req, res) {
    try {
      // Verify user enrollment
      const { quizId } = req.params;
      const { answers } = req.body;

      const {
        rows: [enrollment],
      } = await query(
        `SELECT e.id FROM enrollments e
            JOIN lessons l ON e.course_id = (
              SELECT m.course_id FROM modules m
              JOIN lessons ON m.id = lessons.module_id
              JOIN quizzes ON lessons.id = quizzes.lesson_id
              WHERE quizzes.id = $1
            )
            WHERE e.user_id = $2`,
        [quizId, req.user.id]
      );

      if (!enrollment) {
        return res
          .status(HTTP_STATUS.FORBIDDEN)
          .json(createResponse(false, "Not enrolled in this course"));
      }

      // Grade quiz
      const result = await QuizModel.gradeAttempt(req.user.id, quizId, answers);

      // Update course progress
      await EnrollmentModel.updateProgress(enrollment.id);

      res.json(
        createResponse(true, "Quiz submitted", {
          score: result.score,
          passed: result.passed,
          attemptId: result.attempt.id,
        })
      );
    } catch (error) {
      res
        .status(HTTP_STATUS.SERVER_ERROR)
        .json(createResponse(false, error.message || "Failed to submit quiz"));
    }
  },

  // Get quiz results
  async getResults(req, res) {
    try {
      const results = await QuizModel.getResults(
        req.user.id,
        req.params.quizId
      );
      res.json(createResponse(true, "Quiz results retrieved", results));
    } catch (error) {
      res
        .status(HTTP_STATUS.SERVER_ERROR)
        .json(createResponse(false, "Failed to fetch quiz results"));
    }
  },
};
