import VideoNoteModel from "../models/videoNoteModel.js";

const VideoNoteController = {

    // Create a new note
  async createNote(req, res, next) {
    try {
      const { lesson_id, timestamp, content } = req.body;
      const user_id = req.user.id;
      
      if (!lesson_id || !content) {
        throw new Error("Lesson ID and content are required");
      }
      
      const note = await VideoNoteModel.create({ user_id, lesson_id, timestamp, content });
      res.status(201).json({ success: true, note });
    } catch (error) {
      next(error);
    }
  },

  // Update a note
  async updateNote(req, res, next) {
    try {
      const { id, content } = req.body;
      
      if (!id || !content) {
        throw new Error("Note ID and content are required");
      }
      
      const note = await VideoNoteModel.update({ id, content });
      res.json({ success: true, note });
    } catch (error) {
      next(error);
    }
  },


  // Delete a note
  async deleteNote(req, res, next) {
    try {
      const { id } = req.params;
      
      if (!id) {
        throw new Error("Note ID is required");
      }
      
      await VideoNoteModel.delete(id);
      res.json({ success: true, message: "Note deleted successfully" });
    } catch (error) {
      next(error);
    }
  },


  // Get all notes for a lesson
  async getLessonNotes(req, res, next) {
    try {
      const { lessonId } = req.params;
      const userId = req.user.id;
      
      if (!lessonId) {
        throw new Error("Lesson ID is required");
      }
      
      const notes = await VideoNoteModel.findByUserAndLesson(userId, lessonId);
      res.json({ success: true, notes });
    } catch (error) {
      next(error);
    }
  }
};

export default VideoNoteController;