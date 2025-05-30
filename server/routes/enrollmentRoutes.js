import { Router } from "express";
import EnrollmentController from "../controllers/enrollmentController.js";
import { authenticate } from "../middlewares/auth.js";

const router = Router();

// All enrollment routes require authentication
router.post("/", authenticate, EnrollmentController.enrollInCourse);
router.get("/:id", authenticate, EnrollmentController.getEnrollment);
router.get("/user/:userId?", authenticate, EnrollmentController.getUserEnrollments);
router.get("/course/:courseId", authenticate, EnrollmentController.getCourseEnrollments);
router.put("/:id/progress", authenticate, EnrollmentController.updateProgress);

export default router;