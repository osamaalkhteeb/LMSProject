import { query } from "../config/db";

const CourseModel = {
  // Create a new course (Instructor only)
  async createCourse({
    title,
    description,
    instructor_id,
    category_id,
    thumbnail_url,
  }) {
    try {
      const { rows } = await query(
        "INSERT INTO courses (title, description, instructor_id, category_id, thumbnail_url) VALUES ($1, $2, $3, $4, $5) RETURNING id",
        [title, description, instructor_id, category_id, thumbnail_url]
      );
      return rows[0];
    } catch (error) {
      console.error("Error creating course:", error);
      throw error;
    }
  },

  // Update Course (Instructor,Admin)
  async updateCourse({ id, updates }) {
    try {
      const { title, description, category_id, thumbnail_url, is_published } =
        updates;
      const { rows } = await query(
        "UPDATE courses SET title = $1, description = $2, category_id = $3, thumbnail_url = $4, is_published = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING id",
        [title, description, category_id, thumbnail_url, is_published, id]
      );
      return rows[0];
    } catch (error) {
      console.error("Error updating course:", error);
      throw error;
    }
  },

  // Delete course (Instructor/Admin)
  async deleteCourse(id) {
    try {
      const { rows } = await query(
        "DELETE FROM courses WHERE id = $1 RETURNING id",
        [id]
      );
      return rows[0];
    } catch (error) {
      console.error("Error deleting course:", error);
      throw error;
    }
  },

  // Get course by ID (with instructor details)
  async getCourseId(id) {
    try {
      const { rows } = await query(
        `SELECT c.*, u.name as instructor_name, u.avatar_url as instructor_avatar 
         FROM courses c
         JOIN users u ON c.instructor_id = u.id
         WHERE c.id = $1`,
        [id]
      );
      return rows[0];
    } catch (error) {
      console.error("Error fetching course:", error);
      throw error;
    }
  },

  // List all courses (filterable by category, instructor, etc.)
  async listCourses({
    category_id,
    instructor_id,
    is_published,
    limit = 20,
    offset = 0,
  }) {
    try {
      let baseQuery = `
        SELECT c.*, u.name as instructor_name, cat.name as category_name
        FROM courses c
        JOIN users u ON c.instructor_id = u.id
        JOIN categories cat ON c.category_id = cat.id
        WHERE c.is_published = true AND c.is_approved = true
      `;
      const params = [];
      let paramIndex = 1;

      // Dynamic filters
      if (category_id) {
        baseQuery += ` AND c.category_id = $${paramIndex++}`;
        params.push(category_id);
      }
      if (instructor_id) {
        baseQuery += ` AND c.instructor_id = $${paramIndex++}`;
        params.push(instructor_id);
      }
      if (is_published) {
        baseQuery += ` AND c.is_published = $${paramIndex++}`;
        params.push(is_published);
      }

      // Pagination
      baseQuery += ` LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
      params.push(limit, offset);

      const { rows } = await query(baseQuery, params);
      return rows;
    } catch (error) {
      console.error("Error fetching courses:", error);
      throw error;
    }
  },

  // Approve course (Admin only)
  async approveCourse(id, is_approved) {
    try {
      const { rows } = await query(
        `UPDATE courses 
         SET is_approved = $1, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $2 
         RETURNING *`,
        [is_approved, id]
      );
      return rows[0];
    } catch (error) {
      console.error("Error approving course:", error);
      throw error;
    }
  },
};

export default CourseModel;
