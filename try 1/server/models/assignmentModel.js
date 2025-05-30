import { query } from "../config/db.js";

const AssignmentModel = {
  // Create a new assignment
  async create({ lesson_id, title, description, deadline }) {
    const { rows } = await query(
      "INSERT INTO assignments (lesson_id, title, description, deadline) VALUES ($1, $2, $3, $4) RETURNING *",
      [lesson_id, title, description, deadline]
    );
    return rows[0];
  },

  // Get assignment by ID
  async findById(id) {
    const { rows } = await query(
      `SELECT a.*, l.title as lesson_title 
       FROM assignments a 
       JOIN lessons l ON a.lesson_id = l.id 
       WHERE a.id = $1`,
      [id]
    );
    return rows[0];
  },

  // Get assignments by lesson
  async findByLesson(lessonId) {
    const { rows } = await query(
      "SELECT * FROM assignments WHERE lesson_id = $1",
      [lessonId]
    );
    return rows;
  },

  // Update an assignment
  async update({ id, title, description, deadline }) {
    const { rows } = await query(
      "UPDATE assignments SET title = $1, description = $2, deadline = $3 WHERE id = $4 RETURNING *",
      [title, description, deadline, id]
    );
    return rows[0];
  },

  // Delete an assignment
  async delete(id) {
    await query("DELETE FROM assignments WHERE id = $1", [id]);
    return { success: true };
  },

  // Submit an assignment
  async submitAssignment({ assignment_id, user_id, submission_url, comments }) {
    const { rows } = await query(
      "INSERT INTO assignment_submissions (assignment_id, user_id, submission_url, comments, submitted_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) RETURNING *",
      [assignment_id, user_id, submission_url, comments]
    );
    return rows[0];
  },

  // Grade an assignment submission
  async gradeSubmission({ submission_id, grade, feedback }) {
    const { rows } = await query(
      "UPDATE assignment_submissions SET grade = $1, feedback = $2, graded_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *",
      [grade, feedback, submission_id]
    );
    return rows[0];
  },

  // Get submission by ID
  async findSubmissionById(id) {
    const { rows } = await query(
      `SELECT s.*, a.title as assignment_title, u.name as user_name 
       FROM assignment_submissions s 
       JOIN assignments a ON s.assignment_id = a.id 
       JOIN users u ON s.user_id = u.id 
       WHERE s.id = $1`,
      [id]
    );
    return rows[0];
  },

  // Get submissions by assignment
  async findSubmissionsByAssignment(assignmentId) {
    const { rows } = await query(
      `SELECT s.*, u.name as user_name 
       FROM assignment_submissions s 
       JOIN users u ON s.user_id = u.id 
       WHERE s.assignment_id = $1 
       ORDER BY s.submitted_at DESC`,
      [assignmentId]
    );
    return rows;
  },

  // Get submissions by user
  async findSubmissionsByUser(userId) {
    const { rows } = await query(
      `SELECT s.*, a.title as assignment_title 
       FROM assignment_submissions s 
       JOIN assignments a ON s.assignment_id = a.id 
       WHERE s.user_id = $1 
       ORDER BY s.submitted_at DESC`,
      [userId]
    );
    return rows;
  }
};

export default AssignmentModel;