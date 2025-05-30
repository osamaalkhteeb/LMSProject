import { query } from "../config/db.js";

const VideoNoteModel = {

    //We create a new video note
  async create({ user_id, lesson_id, timestamp, content }) {
    const { rows } = await query(
      "INSERT INTO video_notes (user_id, lesson_id, timestamp, content, created_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) RETURNING *",
      [user_id, lesson_id, timestamp, content]
    );
    return rows[0];
  },

  //We update a video note
  async update({ id, content }) {
    const { rows } = await query(
      "UPDATE video_notes SET content = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
      [content, id]
    );
    return rows[0];
  },

  //We delete a video note
  async delete(id) {
    await query("DELETE FROM video_notes WHERE id = $1", [id]);
    return { success: true };
  },

  //We find all video notes for a user and lesson
  async findByUserAndLesson(userId, lessonId) {
    const { rows } = await query(
      "SELECT * FROM video_notes WHERE user_id = $1 AND lesson_id = $2 ORDER BY timestamp ASC",
      [userId, lessonId]
    );
    return rows;
  }
};

export default VideoNoteModel;