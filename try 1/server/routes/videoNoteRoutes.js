import { Router } from "express";
import VideoNoteController from "../controllers/videoNoteController.js";
import { authenticate } from "../middlewares/auth.js";

const router = Router();

router.post("/", authenticate, VideoNoteController.createNote); // Create a new video note
router.put("/", authenticate, VideoNoteController.updateNote);// Update a video note
router.delete("/:id", authenticate, VideoNoteController.deleteNote);// Delete a video note
router.get("/lesson/:lessonId", authenticate, VideoNoteController.getLessonNotes);// Get notes for a lesson

export default router;