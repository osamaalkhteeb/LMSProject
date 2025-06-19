import { query } from "../config/db.js";

const CourseModel = {
  // Create a new course (Instructor only)
  async createCourse({
    title,
    description,
    instructorId,
    categoryId,
    thumbnailUrl,
  }) {
    try {
      const { rows } = await query(
        "INSERT INTO courses (title, description, instructor_id, category_id, thumbnail_url) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [title, description, instructorId, categoryId, thumbnailUrl]
      );
      return rows[0];
    } catch (error) {
      console.error("Error creating course:", error);
      throw error;
    }
  },

  // Update Course (Instructor/Admin)
  async updateCourse(id, updates) {
    try {
      const fields = [];
      const values = [];
      let paramIndex = 1;

      // Build dynamic update query
      Object.keys(updates).forEach((key) => {
        if (updates[key] !== undefined) {
          fields.push(`${key} = $${paramIndex++}`);
          values.push(updates[key]);
        }
      });

      if (fields.length === 0) {
        throw new Error("No fields to update");
      }

      // Add updated_at timestamp
      fields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const updateQuery = `
        UPDATE courses 
        SET ${fields.join(", ")} 
        WHERE id = $${paramIndex} 
        RETURNING *
      `;

      const { rows } = await query(updateQuery, values);
      return rows[0];
    } catch (error) {
      console.error("Error updating course:", error);
      throw error;
    }
  },

  // Delete course (Instructor/Admin)
  async deleteCourse(id) {
    try {
      // Start transaction
      await query("BEGIN");
      
      // Delete lesson completions first
      await query(
        "DELETE FROM lesson_completions WHERE lesson_id IN (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id WHERE m.course_id = $1)",
        [id]
      );
      
      // Delete assignments and submissions
      await query(
        "DELETE FROM submissions WHERE assignment_id IN (SELECT a.id FROM assignments a JOIN lessons l ON a.lesson_id = l.id JOIN modules m ON l.module_id = m.id WHERE m.course_id = $1)",
        [id]
      );
      
      await query(
        "DELETE FROM assignments WHERE lesson_id IN (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id WHERE m.course_id = $1)",
        [id]
      );
      
      // Delete lessons
      await query(
        "DELETE FROM lessons WHERE module_id IN (SELECT id FROM modules WHERE course_id = $1)",
        [id]
      );
      
      // Delete modules
      await query(
        "DELETE FROM modules WHERE course_id = $1",
        [id]
      );
      
      // Delete enrollments
      await query(
        "DELETE FROM enrollments WHERE course_id = $1",
        [id]
      );
      
      // Finally delete the course
      const { rows } = await query(
        "DELETE FROM courses WHERE id = $1 RETURNING *",
        [id]
      );
      
      // Commit transaction
      await query("COMMIT");
      
      return rows[0];
    } catch (error) {
      // Rollback transaction on error
      await query("ROLLBACK");
      console.error("Error deleting course:", error);
      throw error;
    }
  },

  // Get course by ID (with instructor and category details)
  async getCourseById(id) {
    try {
      const { rows } = await query(
        `SELECT c.*, 
                u.name as instructor_name, 
                u.avatar_url as instructor_avatar,
                cat.name as category_name,
                COUNT(e.id) as enrolled_count
         FROM courses c
         LEFT JOIN users u ON c.instructor_id = u.id
         LEFT JOIN categories cat ON c.category_id = cat.id
         LEFT JOIN enrollments e ON c.id = e.course_id
         WHERE c.id = $1
         GROUP BY c.id, u.name, u.avatar_url, cat.name`,
        [id]
      );
      return rows[0];
    } catch (error) {
      console.error("Error fetching course:", error);
      throw error;
    }
  },

  // List courses with flexible filtering
  async listCourses({
    categoryId,
    instructorId,
    isPublished,
    isApproved,
    search,
    limit = 20,
    offset = 0,
  }) {
    try {
      let baseQuery = `
        SELECT c.*, 
              u.name as instructor_name, 
              u.avatar_url as instructor_avatar,
              cat.name as category_name,
              COUNT(e.id) as enrolled_count
        FROM courses c
        LEFT JOIN users u ON c.instructor_id = u.id
        LEFT JOIN categories cat ON c.category_id = cat.id
        LEFT JOIN enrollments e ON c.id = e.course_id
        WHERE 1=1
      `;

      const params = [];
      let paramIndex = 1;

      // Filter by category
      if (categoryId) {
        baseQuery += ` AND c.category_id = $${paramIndex++}`;
        params.push(categoryId);
      }

      // Filter by instructor
      if (instructorId) {
        baseQuery += ` AND c.instructor_id = $${paramIndex++}`;
        params.push(instructorId);
      }

      // Filter by published status
      if (isPublished !== undefined) {
        baseQuery += ` AND c.is_published = $${paramIndex++}`;
        params.push(isPublished);
      }

      // Filter by approved status
      if (isApproved !== undefined) {
        baseQuery += ` AND c.is_approved = $${paramIndex++}`;
        params.push(isApproved);
      }

      // Search by title or description
      if (search) {
        const searchPattern = `%${search}%`;
        baseQuery += ` AND (c.title ILIKE $${paramIndex} OR c.description ILIKE $${paramIndex})`;
        params.push(searchPattern);
        paramIndex++;
      }

      // Add GROUP BY clause for aggregation
      baseQuery += ` GROUP BY c.id, u.name, u.avatar_url, cat.name`;
      
      // Add ordering and pagination
      baseQuery += ` ORDER BY c.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
      params.push(limit, offset);

      const { rows } = await query(baseQuery, params);

      // Get total count for pagination
      let countQuery = `
        SELECT COUNT(*) as total
        FROM courses c
        WHERE 1=1
      `;

      const countParams = [];
      let countParamIndex = 1;

      // Apply same filters for count
      if (categoryId) {
        countQuery += ` AND c.category_id = $${countParamIndex++}`;
        countParams.push(categoryId);
      }
      if (instructorId) {
        countQuery += ` AND c.instructor_id = $${countParamIndex++}`;
        countParams.push(instructorId);
      }
      if (isPublished !== undefined) {
        countQuery += ` AND c.is_published = $${countParamIndex++}`;
        countParams.push(isPublished);
      }
      if (isApproved !== undefined) {
        countQuery += ` AND c.is_approved = $${countParamIndex++}`;
        countParams.push(isApproved);
      }
      if (search) {
        countQuery += ` AND (c.title ILIKE $${countParamIndex++} OR c.description ILIKE $${countParamIndex++})`;
        countParams.push(`%${search}%`, `%${search}%`);
        countParamIndex++;
      }

      const { rows: countRows } = await query(countQuery, countParams);
      const total = parseInt(countRows[0].total);

      return {
        courses: rows,
        pagination: {
          total,
          limit,
          offset,
          pages: Math.ceil(total / limit),
          currentPage: Math.floor(offset / limit) + 1,
        },
      };
    } catch (error) {
      console.error("Error fetching courses:", error);
      throw error;
    }
  },

  // Get public courses (published and approved only)
  async getPublicCourses({ categoryId, search, limit = 20, offset = 0 }) {
    return this.listCourses({
      categoryId,
      search,
      isPublished: true,
      isApproved: true,
      limit,
      offset,
    });
  },

  // Get instructor's courses (all their courses regardless of status)
  async getInstructorCourses(
    instructorId,
    { categoryId, limit = 20, offset = 0 }
  ) {
    return this.listCourses({
      instructorId,
      categoryId,
      limit,
      offset,
    });
  },

  // Get pending courses (published but not approved - for admin)
  async getPendingCourses({ limit = 20, offset = 0 }) {
    return this.listCourses({
      isPublished: true,
      isApproved: false,
      limit,
      offset,
    });
  },

  // Approve/Reject course (Admin only)
  async approveCourse(id, isApproved) {
    try {
      const { rows } = await query(
        `UPDATE courses 
         SET is_approved = $1, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $2 
         RETURNING *`,
        [isApproved, id]
      );
      return rows[0];
    } catch (error) {
      console.error("Error approving course:", error);
      throw error;
    }
  },

  // Publish/Unpublish course (Instructor/Admin)
  async publishCourse(id, isPublished) {
    try {
      const { rows } = await query(
        `UPDATE courses 
         SET is_published = $1, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $2 
         RETURNING *`,
        [isPublished, id]
      );
      return rows[0];
    } catch (error) {
      console.error("Error publishing course:", error);
      throw error;
    }
  },

  // Get course statistics
  async getCourseStats() {
    try {
      const { rows } = await query(`
        SELECT 
          COUNT(*) as total_courses,
          COUNT(CASE WHEN is_published = true THEN 1 END) as published_courses,
          COUNT(CASE WHEN is_approved = true THEN 1 END) as approved_courses,
          COUNT(CASE WHEN is_published = true AND is_approved = true THEN 1 END) as public_courses
        FROM courses
      `);
      return rows[0];
    } catch (error) {
      console.error("Error fetching course stats:", error);
      throw error;
    }
  },
};

export default CourseModel;
