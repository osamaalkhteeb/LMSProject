import express from "express";
import { EnrollmentController } from "../controllers/enrollment.controller.js";
import {
  authenticate,
  authorize,
  isCourseInstructorOrAdmin,
} from "../middleware/auth.js";

const router = express.Router();

// Student Endpoints

router.post(
  "/",
  authenticate,
  authorize("student"),
  EnrollmentController.enroll
);
router.get(
  "/",
  authenticate,
  authorize("student"),
  EnrollmentController.listEnrollments
);

// Instructor/Admin Endpoints
router.get(
  "/course/:courseId",
  authenticate,
  authorize(["instructor", "admin"]),
  isCourseInstructorOrAdmin,
  EnrollmentController.getByCourse
);

router.delete(
  "/:userId/:courseId",
  authenticate,
  authorize(["instructor", "admin"]),
  isCourseInstructorOrAdmin,
  EnrollmentController.unenroll
);

export default router;