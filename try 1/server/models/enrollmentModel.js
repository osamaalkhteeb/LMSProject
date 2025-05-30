import { query } from "../config/db.js";

const EnrollmentModel = {
  // Enroll a user in a course
  async create({ user_id, course_id }) {
    // Check if enrollment already exists
    const existingEnrollment = await this.findByUserAndCourse(user_id, course_id);
    if (existingEnrollment) {
      return existingEnrollment;
    }
    
    const { rows } = await query(
      "INSERT INTO enrollments (user_id, course_id, progress) VALUES ($1, $2, 0) RETURNING *",
      [user_id, course_id]
    );
    return rows[0];
  },

  // Get enrollment by ID
  async findById(id) {
    const { rows } = await query(
      `SELECT e.*, c.title as course_title, u.name as user_name 
       FROM enrollments e 
       JOIN courses c ON e.course_id = c.id 
       JOIN users u ON e.user_id = u.id 
       WHERE e.id = $1`,
      [id]
    );
    return rows[0];
  },

  // Find enrollment by user and course
  async findByUserAndCourse(userId, courseId) {
    const { rows } = await query(
      "SELECT * FROM enrollments WHERE user_id = $1 AND course_id = $2",
      [userId, courseId]
    );
    return rows[0];
  },

  // Get all enrollments for a user
  async findByUser(userId) {
    const { rows } = await query(
      `SELECT e.*, c.title as course_title, c.thumbnail_url 
       FROM enrollments e 
       JOIN courses c ON e.course_id = c.id 
       WHERE e.user_id = $1 
       ORDER BY e.enrolled_at DESC`,
      [userId]
    );
    return rows;
  },

  // Get all enrollments for a course
  async findByCourse(courseId) {
    const { rows } = await query(
      `SELECT e.*, u.name as user_name, u.email as user_email 
       FROM enrollments e 
       JOIN users u ON e.user_id = u.id 
       WHERE e.course_id = $1 
       ORDER BY e.enrolled_at DESC`,
      [courseId]
    );
    return rows;
  },

  // Update enrollment progress
  async updateProgress({ id, progress }) {
    const { rows } = await query(
      "UPDATE enrollments SET progress = $1 WHERE id = $2 RETURNING *",
      [progress, id]
    );
    
    // If progress is 100%, set completed_at
    if (progress === 100) {
      await query(
        "UPDATE enrollments SET completed_at = CURRENT_TIMESTAMP WHERE id = $1",
        [id]
      );
    }
    
    return rows[0];
  }
};

export default EnrollmentModel;