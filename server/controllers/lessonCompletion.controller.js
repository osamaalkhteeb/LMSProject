import LessonCompletionModel from "../models/lessonCompletion.model.js";
import EnrollmentModel from "../models/enrollment.model.js";
import { createResponse } from "../utils/helper.js";
import { HTTP_STATUS } from "../constants.js";

export const LessonCompletionController = {
  async markComplete(req, res) {
    try {
      const { lessonId } = req.body;
      const { userId } = req.user.id;

      // Get enrollment ID (assuming 1 enrollment per course)
      const {
        rows: [enrollment],
      } = await query(
        `SELECT e.id 
                 FROM enrollments e
                 JOIN modules m ON e.course_id = m.course_id
                 JOIN lessons l ON m.id = l.module_id
                 WHERE e.user_id = $1 AND l.id = $2`,
        [userId, lessonId]
      );

      if (!enrollment) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json(createResponse(false, "Enrollment not found"));
      }

      await LessonCompletionController.markComplete(userId, lessonId);
      const progress = await EnrollmentModel.updateProgress(enrollment.id);
      res.json(createResponse(true, "Lesson marked as complete", { progress }));
    } catch (error) {
      console.error("Error marking lesson as complete:", error);
      res
       .status(HTTP_STATUS.SERVER_ERROR)
       .json(createResponse(false, "Failed to mark lesson complete"));
    }
  },
};
