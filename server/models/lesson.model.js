import { query } from "../config/db.js";

const LessonModel = {
  // Create a lesson
  async create({ moduleId, title, contentType, contentUrl, duration, orderNum }) {
    const { rows } = await query(
      `INSERT INTO lessons 
       (module_id, title, content_type, content_url, duration, order_num)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [moduleId, title, contentType, contentUrl, duration, orderNum]
    );
    return rows[0];
  },

  // Get lesson with full details
  async getById(lessonId) {
    const { rows: [lesson] } = await query(
      `SELECT l.*, m.course_id,
              (SELECT q.id FROM quizzes q WHERE q.lesson_id = l.id) AS quiz_id,
              (SELECT a.id FROM assignments a WHERE a.lesson_id = l.id) AS assignment_id
       FROM lessons l
       JOIN modules m ON l.module_id = m.id
       WHERE l.id = $1`,
      [lessonId]
    );
    return lesson;
  },
  
  // Update a lesson
  async update(lessonId, { title, contentType, contentUrl, duration, orderNum }) {
    const { rows: [updatedLesson] } = await query(
      `UPDATE lessons
       SET title = COALESCE($1, title),
           content_type = COALESCE($2, content_type),
           content_url = COALESCE($3, content_url),
           duration = COALESCE($4, duration),
           order_num = COALESCE($5, order_num)
       WHERE id = $6
       RETURNING *`,
      [title, contentType, contentUrl, duration, orderNum, lessonId]
    );
    return updatedLesson;
  },
  
  // Delete a lesson
  async delete(lessonId) {
    // Start transaction
    await query('BEGIN');
    
    try {
      // Delete associated quizzes
      await query(
        `DELETE FROM quizzes WHERE lesson_id = $1`,
        [lessonId]
      );
      
      // Delete associated assignments
      await query(
        `DELETE FROM assignments WHERE lesson_id = $1`,
        [lessonId]
      );
      
      // Delete lesson completions
      await query(
        `DELETE FROM lesson_completions WHERE lesson_id = $1`,
        [lessonId]
      );
      
      // Delete video notes
      await query(
        `DELETE FROM video_notes WHERE lesson_id = $1`,
        [lessonId]
      );
      
      // Delete the lesson
      const { rowCount } = await query(
        `DELETE FROM lessons WHERE id = $1`,
        [lessonId]
      );
      
      await query('COMMIT');
      return rowCount > 0;
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  }
};

export default LessonModel;