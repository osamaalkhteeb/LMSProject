import express from "express";
import { CourseController } from "../controllers/course.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", CourseController.listCourses);
router.get("/:id", CourseController.getCourse);

// Instructor routes
router.post(
  "/",
  authenticate,
  authorize(["instructor"]),
  CourseController.createCourse
);
router.put(
  "/:id",
  authenticate,
  authorize(["instructor"]),
  CourseController.updateCourse
);
router.delete(
  "/:id",
  authenticate,
  authorize(["instructor"]),
  CourseController.deleteCourse
);

// Admin routes
router.patch(
  "/:id/approve",
  authenticate,
  authorize(["admin"]),
  CourseController.approvedCourse
);

export default router;
