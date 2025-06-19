
import QuizModel from "../models/quiz.model.js";
import EnrollmentModel from "../models/enrollment.model.js";
import LessonCompletionModel from "../models/lessonCompletion.model.js";
import { createResponse } from "../utils/helper.js";
import { HTTP_STATUS } from "../config/constants.js";

export const QuizController = {
  // Get quizzes by lesson
  async getByLesson(req, res) {
    try {
      const { lessonId } = req.params;
      const quizzes = await QuizModel.getByLessonId(lessonId);
      res.json(createResponse(true, "Quizzes retrieved", quizzes));
    } catch (error) {
      console.error("Get quizzes by lesson error:", error);
      res.status(HTTP_STATUS.SERVER_ERROR).json(
        createResponse(false, "Failed to fetch quizzes")
      );
    }
  },
  // Get quiz details
  async getQuiz(req, res) {
    try {
      const quiz = await QuizModel.getById(req.params.quizId);
      if (!quiz) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json(createResponse(false, null, "Quiz not found"));
      }

      // Get user's attempt information if user is authenticated
      let attemptInfo = null;
      if (req.user) {
        try {
          attemptInfo = await QuizModel.getUserAttemptInfo(req.params.quizId, req.user.id);
        } catch (attemptError) {
          console.error("Error fetching attempt info:", attemptError);
        }
      }

      const quizWithAttemptInfo = {
        ...quiz,
        attemptInfo
      };

      res.json(createResponse(true, "Quiz retrieved successfully", quizWithAttemptInfo));
    } catch (error) {
      console.error("Quiz getById error:", error);
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
      const { answers, startTime } = req.body;

      const enrollment = await QuizModel.getEnrollmentByUserAndQuiz(quizId, req.user.id);

      if (!enrollment) {
        return res
          .status(HTTP_STATUS.FORBIDDEN)
          .json(createResponse(false, "Not enrolled in this course"));
      }

      // Grade quiz
      const result = await QuizModel.gradeAttempt(req.user.id, quizId, answers, startTime);

      // Get quiz details to find the associated lesson
      const quiz = await QuizModel.getById(quizId);
      
      // If quiz is passed, mark the associated lesson as complete
      if (result.passed && quiz.lesson_id) {
        const LessonCompletionModel = require('../models/lessonCompletion.model');
        try {
          await LessonCompletionModel.markComplete(req.user.id, quiz.lesson_id);
        } catch (error) {
          // Ignore if already completed
          if (!error.message.includes('already completed')) {
            console.error('Error marking quiz lesson as complete:', error);
          }
        }
      }

      // Update course progress
      await EnrollmentModel.updateProgress(enrollment.id);

      res.json(
        createResponse(true, result.isRetake ? "Quiz retaken successfully" : "Quiz submitted successfully", {
          score: result.score,
          passed: result.passed,
          attemptId: result.attempt.id,
          attemptNumber: result.attemptNumber,
          isRetake: result.isRetake
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
      console.error("Error fetching quiz results:", error);
      res
        .status(500)
        .json(createResponse(false, "Failed to fetch quiz results"));
    }
  },

  // Get all quiz attempts for a user
  async getAllAttempts(req, res) {
    try {
      const attempts = await QuizModel.getAllAttempts(
        req.user.id,
        req.params.quizId
      );
      res.json(createResponse(true, "Quiz attempts retrieved", attempts));
    } catch (error) {
      console.error("Error fetching quiz attempts:", error);
      res
        .status(500)
        .json(createResponse(false, "Failed to fetch quiz attempts"));
    }
  },
  // Create quiz
  async createQuiz(req, res) {
    try {
      const { lessonId } = req.params;
      const quiz = await QuizModel.create({
        lessonId,
        ...req.body,
      });
      res
        .status(HTTP_STATUS.CREATED)
        .json(createResponse(true, "Quiz created successfully", quiz));
    } catch (error) {
      res
        .status(HTTP_STATUS.SERVER_ERROR)
        .json(createResponse(false, "Failed to create quiz"));
    }
  },

  // Update quiz
  async updateQuiz(req, res) {
    try {
      const { quizId } = req.params;
      const quiz = await QuizModel.update(quizId, req.body);

      if (!quiz) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json(createResponse(false, null, "Quiz not found"));
      }

      res.json(createResponse(true, "Quiz updated successfully", quiz));
    } catch (error) {
      res
        .status(HTTP_STATUS.SERVER_ERROR)
        .json(createResponse(false, error.message || "Failed to update quiz"));
    }
  },

  // Delete quiz
  async deleteQuiz(req, res) {
    try {
      const { quizId } = req.params;
      const deleted = await QuizModel.delete(quizId);

      if (!deleted) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json(createResponse(false, null, "Quiz not found"));
      }

      res.json(createResponse(true, "Quiz deleted successfully"));
    } catch (error) {
      res
        .status(HTTP_STATUS.SERVER_ERROR)
        .json(createResponse(false, error.message || "Failed to delete quiz"));
    }
  },
};
