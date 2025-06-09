import express from 'express';
import { LessonCompletionController } from '../controllers/lessonCompletion.controller.js';
import { authenticate,authorize } from '../middleware/auth';

const router = express.Router();

router.post('/',authenticate,authorize(['student']),LessonCompletionController.markComplete);

export default router;