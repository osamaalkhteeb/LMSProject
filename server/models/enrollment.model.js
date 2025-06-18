import { query } from "../config/db.js";

const EnrollmentModel = {
  // Enroll a student in a course
  async enroll(userId, courseId) {
    try {
      //check if already enrolled
      const existing = await query(
        "SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2",
        [userId, courseId]
      );

      if (existing.rows.length > 0) {
        throw new Error("Already enrolled in this course");
      }
      const { rows } = await query(
        "INSERT INTO enrollments (user_id, course_id) VALUES ($1, $2) RETURNING id",
        [userId, courseId]
      );
      return rows[0];
    } catch (error) {
      console.error("Error enrolling student:", error);
      throw error;
    }
  },

  // Get all enrollments for a user ( with course details)
  async getByUser(userId) {
    try {
      const { rows } = await query(
        `SELECT e.*, c.title, c.description, c.thumbnail_url, 
        c.instructor_id, u.name as instructor_name
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        JOIN users u ON c.instructor_id = u.id
        WHERE e.user_id = $1`,
        [userId]
      );
      return rows;
    } catch (error) {
      console.error("Error getting enrollments:", error);
      throw error;
    }
  },

  // Get all enrollments for a course ( for instructors/admins)
  async getByCourse(courseId) {
    try {
      const { rows } = await query(
        `SELECT e.*, u.name as user_name, u.email, u.avatar_url,
        e.progress, e.enrolled_at, e.completed_at
         FROM enrollments e
         JOIN users u ON e.user_id = u.id
         WHERE e.course_id = $1
         ORDER BY e.enrolled_at DESC`,
        [courseId]
      );
      return rows;
    } catch (error) {
      console.error("Error getting enrollments:", error);
      throw error;
    }
  },

  // Unenroll a student from a course (Admin/Instructor)
  async unenroll(userId, courseId) {
    try {
      // First check if the enrollment exists
      const existingEnrollment = await query(
        "SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2",
        [userId, courseId]
      );

      if (existingEnrollment.rows.length === 0) {
        throw new Error("Enrollment not found");
      }

      // Clean up dependent records first
      // await query(
      //   `DELETE FROM lesson_completions
      //    WHERE user_id = $1 AND lesson_id IN (
      //      SELECT l.id FROM lessons l
      //      JOIN modules m ON l.module_id = m.id
      //      WHERE m.course_id = $2
      //    )`,
      //   [user_id, course_id]
      // );

      // Remove enrollment 
      const { rows } = await query(
        "DELETE FROM enrollments WHERE user_id = $1 AND course_id = $2 RETURNING id",
        [userId, courseId]
      );
      return rows[0];
    } catch (error) {
      console.error("Error during un-enrollment:", error);
      throw error;
    }
  },

  // Calculate and update progress automatically
  async updateProgress(enrollmentId) {
    try {
      // Get enrollment details
      const {
        rows: [enrollment],
      } = await query(
        "SELECT user_id, course_id FROM enrollments WHERE id = $1",
        [enrollmentId]
      );

      if (!enrollment) {
        throw new Error("Enrollment not found");
      }

      // count total completable items (lessons with video/text, quizzes, and assignments)
      const {
        rows: [totals],
      } = await query(
        `
        SELECT 
          (SELECT COUNT(*) FROM lessons l
           JOIN modules m ON l.module_id = m.id
           WHERE m.course_id = $1 AND l.content_type IN ('video', 'text')) AS video_text_lessons,
          (SELECT COUNT(*) FROM quizzes q
           JOIN lessons l ON q.lesson_id = l.id
           JOIN modules m ON l.module_id = m.id
           WHERE m.course_id = $1) AS quizzes,
          (SELECT COUNT(*) FROM assignments a
           JOIN lessons l ON a.lesson_id = l.id
           JOIN modules m ON l.module_id = m.id
           WHERE m.course_id = $1) AS assignments`,
        [enrollment.course_id]
      );

      // count completed items (separate tracking for each type)
      const {
        rows: [completed],
      } = await query(
        `
        SELECT 
          (SELECT COUNT(*) FROM lesson_completions lc
           JOIN lessons l ON lc.lesson_id = l.id
           JOIN modules m ON l.module_id = m.id
           WHERE lc.user_id = $1 AND m.course_id = $2 AND l.content_type IN ('video', 'text')) AS video_text_lessons,
          (SELECT COUNT(DISTINCT qr.quiz_id) FROM quiz_results qr
            JOIN quizzes q ON qr.quiz_id = q.id
            JOIN lessons l ON q.lesson_id = l.id
            JOIN modules m ON l.module_id = m.id
            WHERE qr.user_id = $1 AND m.course_id = $2 AND qr.score >= COALESCE(q.passing_score, 60)) AS quizzes,
          (SELECT COUNT(DISTINCT s.assignment_id) FROM submissions s
           JOIN assignments a ON s.assignment_id = a.id
           JOIN lessons l ON a.lesson_id = l.id
           JOIN modules m ON l.module_id = m.id
           WHERE s.user_id = $1 AND m.course_id = $2) AS assignments
      `,
        [enrollment.user_id, enrollment.course_id]
      );

      // calculate progress (sum all completion types)
      const totalItems = parseInt(totals.video_text_lessons) + parseInt(totals.quizzes) + parseInt(totals.assignments);
      const completedItems = parseInt(completed.video_text_lessons) + parseInt(completed.quizzes) + parseInt(completed.assignments);
      
      const progress =
        totalItems > 0
          ? Math.min(100, Math.round((completedItems / totalItems) * 100))
          : 0;

      // update enrollment
      await query(
        `UPDATE enrollments 
         SET progress = $1, 
             completed_at = CASE WHEN $1 = 100 THEN CURRENT_TIMESTAMP ELSE completed_at END
         WHERE id = $2`,
        [progress, enrollmentId]
      );
      return progress;
    } catch (error) {
      console.error("Progress calculation error: ", error);
      throw error;
    }
  },

  // Get enrollment by id with full details 
  async getById (enrollmentId) {
    try {
        const { rows } = await query(
            `SELECT e.*, c.title as course_title, 
            u.name as student_name, u.avatar_url as student_avatar
     FROM enrollments e
     JOIN courses c ON e.course_id = c.id
     JOIN users u ON e.user_id = u.id
     WHERE e.id = $1`,
    [enrollmentId]
  );
      return rows[0];
    } catch (error) {
        console.error("Error getting enrollment: ", error);
        throw error;
    }
  },

  // Get enrollment by user and course
  async getByUserAndCourse(userId, courseId) {
    try {
      const { rows } = await query(
        "SELECT * FROM enrollments WHERE user_id = $1 AND course_id = $2",
        [userId, courseId]
      );
      return rows[0];
    } catch (error) {
      console.error("Error getting enrollment by user and course:", error);
      throw error;
    }
  },

  // Get all enrollments with user and course details (Admin only)
  async getAllEnrollments() {
    try {
      const { rows } = await query(
        `SELECT e.*, 
         u.name as user_name, u.email as user_email,
         c.title as course_title, c.thumbnail_url
         FROM enrollments e
         JOIN users u ON e.user_id = u.id
         JOIN courses c ON e.course_id = c.id
         ORDER BY e.enrolled_at DESC`
      );
      return rows;
    } catch (error) {
      console.error("Error getting all enrollments:", error);
      throw error;
    }
  }
};

export default EnrollmentModel;