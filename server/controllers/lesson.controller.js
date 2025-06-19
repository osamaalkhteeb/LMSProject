import LessonModel from "../models/lesson.model.js";
import { createResponse} from "../utils/helper.js";
import { HTTP_STATUS } from "../config/constants.js";

export const LessonController = {
  async create(req, res) {
    try {
      const lesson = await LessonModel.create({
        moduleId: req.params.moduleId,
        ...req.body
      });
      res.status(HTTP_STATUS.CREATED).json(
        createResponse(true, "Lesson created", lesson)
      );
    } catch (error) {
      res.status(HTTP_STATUS.SERVER_ERROR).json(
        createResponse(false, "Failed to create lesson")
      );
    }
  },

  async getById(req, res) {
    try {
      const lesson = await LessonModel.getById(req.params.lessonId);
      if (!lesson) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          createResponse(false, "Lesson not found")
        );
      }
      res.json(createResponse(true, "Lesson retrieved", lesson));
    } catch (error) {
      res.status(HTTP_STATUS.SERVER_ERROR).json(
        createResponse(false, "Failed to fetch lesson")
      );
    }
  },
  
  async update(req, res) {
    try {
      const { title, contentType, contentUrl, duration } = req.body;
      const updatedLesson = await LessonModel.update(req.params.lessonId, {
        title,
        content_type: contentType,
        content_url: contentUrl,
        duration
      });
      
      if (!updatedLesson) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          createResponse(false, "Lesson not found")
        );
      }
      
      res.json(createResponse(true, "Lesson updated", updatedLesson));
    } catch (error) {
      console.error('❌ Error updating lesson:', error);
      res.status(HTTP_STATUS.SERVER_ERROR).json(
        createResponse(false, "Failed to update lesson")
      );
    }
  },
  
  async delete(req, res) {
    try {
      const deleted = await LessonModel.delete(req.params.lessonId);
      
      if (!deleted) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          createResponse(false, "Lesson not found")
        );
      }
      
      res.json(createResponse(true, "Lesson deleted successfully"));
    } catch (error) {
      res.status(HTTP_STATUS.SERVER_ERROR).json(
        createResponse(false, "Failed to delete lesson")
      );
    }
  }
};