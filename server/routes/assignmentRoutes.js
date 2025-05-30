import { Router } from "express";
import AssignmentController from "../controllers/assignmentController.js";
import { authenticate } from "../middlewares/auth.js";

const router = Router();

// All assignment routes require authentication
router.post("/", authenticate, AssignmentController.createAssignment);
router.get("/:id", authenticate, AssignmentController.getAssignment);
router.get("/lesson/:lessonId", authenticate, AssignmentController.getLessonAssignments);
router.put("/:id", authenticate, AssignmentController.updateAssignment);
router.delete("/:id", authenticate, AssignmentController.deleteAssignment);

// Submission routes
router.post("/:id/submit", authenticate, AssignmentController.submitAssignment);
router.put("/:id/grade", authenticate, AssignmentController.gradeAssignment);
router.get("/:assignmentId/submissions", authenticate, AssignmentController.getAssignmentSubmissions);
router.get("/submissions/user/:userId?", authenticate, AssignmentController.getUserSubmissions);

export default router;