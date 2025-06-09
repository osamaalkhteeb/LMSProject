import { query } from "../config/db";

const EnrollmentModel = {
  // Enroll a student in a course
  async enroll(user_id, course_id) {
    try {
      //check if already enrolled
      const existing = await query(
        "SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2",
        [user_id, course_id]
      );

      if (existing.rows.length > 0) {
        throw new Error("Already enrolled in this course");
      }
      const { rows } = await query(
        "INSERT INTO enrollments (user_id, course_id) VALUES ($1, $2) RETURNING id",
        [user_id, course_id]
      );
      return rows[0];
    } catch (error) {
      console.error("Error enrolling student:", error);
      throw error;
    }
  },

  // Get all enrollments for a user ( with course details)
  async getByUser(user_id) {
    try {
      const { rows } = await query(
        `SELECT e.*, c.title, c.thumbnail_url, 
        c.instructor_id, u.name as instructor_name
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        JOIN users u ON c.instructor_id = u.id
        WHERE e.user_id = $1`,
        [user_id]
      );
    } catch (error) {
      console.error("Error getting enrollments:", error);
      throw error;
    }
  },

  // Get all enrollments for a course ( for instructors/admins)
  async getByCourse(course_id) {
    try {
      const { rows } = await query(
        `SELECT e.*, u.name as user_name, u.email, u.avatar_url,
        e.progress, e.enrolled_at, e.completed_at
         FROM enrollments e
         JOIN users u ON e.user_id = u.id
         WHERE e.course_id = $1
         ORDER BY e.enrolled_at DESC`,
        [course_id]
      );
      return rows;
    } catch (error) {
      console.error("Error getting enrollments:", error);
      throw error;
    }
  },

  // Unenroll a student from a course (Admin/Instructor)
  async unenroll(user_id, course_id) {
    try {

        // Clean up dependent records first
    //   await query(
    //     `DELETE FROM lesson_completions
    //      WHERE user_id = $1 AND lesson_id IN (
    //        SELECT l.id FROM lessons l
    //        JOIN modules m ON l.module_id = m.id
    //        WHERE m.course_id = $2
    //      )`,
    //     [userId, courseId]
    //   );

    // Remove enrollment 
      const { rows } = await query(
        "DELETE FROM enrollments WHERE user_id = $1 AND course_id = $2 RETURNING id",
        [user_id, course_id]
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

      // count total completable items
      const {
        rows: [totals],
      } = await query(
        `
        SELECT 
          (SELECT COUNT(*) FROM lessons l
           JOIN modules m ON l.module_id = m.id
           WHERE m.course_id = $1) AS lessons,
          
          (SELECT COUNT(*) FROM assignments a
           JOIN lessons l ON a.lesson_id = l.id
           JOIN modules m ON l.module_id = m.id
           WHERE m.course_id = $1) AS assignments,
      
        (SELECT COUNT(*) FROM quizzes q
           JOIN lessons l ON q.lesson_id = l.id
           JOIN modules m ON l.module_id = m.id
           WHERE m.course_id = $1) AS quizzes`,
        [enrollment.course_id]
      );

      // count completed items
      const {
        rows: [completed],
      } = await query(
        `
        SELECT 
          (SELECT COUNT(*) FROM lesson_completions
           WHERE user_id = $1 AND lesson_id IN (
             SELECT l.id FROM lessons l
             JOIN modules m ON l.module_id = m.id
             WHERE m.course_id = $2
           )) AS lessons,
           
          (SELECT COUNT(*) FROM submissions
           WHERE user_id = $1 AND assignment_id IN (
             SELECT a.id FROM assignments a
             JOIN lessons l ON a.lesson_id = l.id
             JOIN modules m ON l.module_id = m.id
             WHERE m.course_id = $2
           ) AND grade IS NOT NULL) AS assignments,
           
          (SELECT COUNT(*) FROM quiz_results
           WHERE user_id = $1 AND quiz_id IN (
             SELECT q.id FROM quizzes q
             JOIN lessons l ON q.lesson_id = l.id
             JOIN modules m ON l.module_id = m.id
             WHERE m.course_id = $2) AND score >= (
             SELECT passing_score FROM quizzes WHERE id = quiz_id
           )) AS quizzes
      `,
        [enrollment.user_id, enrollment.course_id]
      );

      // calculate progress
      const totalItems = totals.lessons + totals.assignments + totals.quizzes;
      const completedItems =
        completed.lessons + completed.assignments + completed.quizzes;
      const progress =
        totalItems > 0
          ? Math.min(100, Math.round((completedItems / totalItems) * 100))
          : 0;

      // update enrollment
      await query(
        `UPDATE enrollments 
         SET progress = $1, 
             updated_at = CURRENT_TIMESTAMP,
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
  }
};

export default EnrollmentModel;