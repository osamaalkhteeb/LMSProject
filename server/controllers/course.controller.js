import CourseModel from "../models/course.model.js";
import { HTTP_STATUS } from "../config/constants.js";
import { createResponse } from "../utils/helper.js";

export const CourseController = {
  // Create course (Instructor only)
  async createCourse(req, res) {
    try {
      const { title, description, category_id, thumbnail_url } = req.body;
      const instructor_id = req.user.id; // from auth middleware

      const course = await CourseModel.createCourse({
        title,
        description,
        instructor_id,
        category_id,
        thumbnail_url,
      });

      res
        .status(HTTP_STATUS.CREATED)
        .json(createResponse(true, "Course created successfully", course));
    } catch (error) {
      console.error("Create course error:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createResponse(false, "Internal server error"));
    }
  },

  // Update course (Instructor/Admin)
  async updateCourse(req, res) {
    try {
      const { id } = req.params;
      const update = req.body;
      const user = req.user;

      // Verify course exists and user is instructor or admin
      const existingCourse = await CourseModel.getCourseById(id);
      if (!existingCourse) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json(createResponse(false, "Course not found"));
      }

      // Instructor can only update their own courses
      if (
        user.role === "instructor" &&
        existingCourse.instructor_id !== user.id
      ) {
        return res
          .status(HTTP_STATUS.FORBIDDEN)
          .json(
            createResponse(
              false,
              "You are not authorized to update this course"
            )
          );
      }

      const updatedCourse = await CourseModel.updateCourse(id, update);
      res.json(
        createResponse(true, "Course updated successfully", updatedCourse)
      );
    } catch (error) {
      console.error("Update course error:", error);
      res
        .status(HTTP_STATUS.SERVER_ERROR)
        .json(createResponse(false, "Failed to update course"));
    }
  },

  // Delete course (Instructor/Admin)
  async deleteCourse(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;

      const existingCourse = await CourseModel.getCourseById(id);
      if (!existingCourse) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json(createResponse(false, "Course not found"));
      }

      // Admin can delete any course, instructors only their own
      if (
        user.role === "instructor" &&
        existingCourse.instructor_id !== user.id
      ) {
        return res
          .status(HTTP_STATUS.FORBIDDEN)
          .json(
            createResponse(
              false,
              "You are not authorized to delete this course"
            )
          );
      }

      await CourseModel.deleteCourse(id);
      res.json(createResponse(true, "Course deleted successfully"));
    } catch (error) {
      console.error("Deleted course error:", error);
      res
        .status(HTTP_STATUS.SERVER_ERROR)
        .json(createResponse(false, "Failed to delete course"));
    }
  },

  // Get course details
  async getCourse(req, res) {
    try {
      const { id } = req.params;
      const course = await CourseModel.getCourseId(id);

      if (!course) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json(createResponse(false, "Course not found"));
      }

      res.json(
        createResponse(true, "Course details retrieved successfully", course)
      );
    } catch (error) {
      console.error("Get course details error:", error);
      res
        .status(HTTP_STATUS.SERVER_ERROR)
        .json(createResponse(false, "Failed to get course details"));
    }
  },

  // List all courses (filterable)
  async listCourses(req, res) {
    try {
      const { category_id, instructor_id } = req.query;
      const courses = await CourseModel.listCourses({
        category_id,
        instructor_id,
        limit: parseInt(req.query.limit) || 20,
        offset: parseInt(req.query.offset) || 0,
      });
      res.json(createResponse(true, "Courses retrieved successfully", courses));
    } catch (error) {
      console.error("List courses error:", error);
      res
        .status(HTTP_STATUS.SERVER_ERROR)
        .json(createResponse(false, "Failed to list courses"));
    }
  },

  // Approve course (Admin only)
  async approvedCourse(req, res) {
    try {
      const { id } = req.params;
      const { is_approved } = req.body;

      if (req.user.role !== "admin") {
        return res
          .status(HTTP_STATUS.FORBIDDEN)
          .json(
            createResponse(
              false,
              "You are not authorized to approve this course"
            )
          );
      }

      const course = await CourseModel.approveCourse(id, is_approved);
      res.json(
        createResponse(
          true,
          `Course ${is_approved ? "approved" : "rejected"} successfully`,
          course
        )
      );
    } catch (error) {
      console.error("Approved course error", error);
      res
        .status(HTTP_STATUS.SERVER_ERROR)
        .json(createResponse(false, "Failed to approve course"));
    }
  },
};
