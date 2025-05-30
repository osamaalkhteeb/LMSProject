import { Router } from "express";
import CoursesController from "../controllers/coursesController.js";
import { authenticate } from "../middlewares/auth.js";

const router = Router();

// Public routes
router.get("/", CoursesController.getAllCourses);
router.get("/:id", CoursesController.getCourseById);

// Protected routes
router.post("/", authenticate, CoursesController.createCourse);
router.put("/:id", authenticate, CoursesController.updateCourse);
router.delete("/:id", authenticate, CoursesController.deleteCourse);
router.get("/instructor/:instructorId?", authenticate, CoursesController.getInstructorCourses);

export default router;