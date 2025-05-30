import { query } from "../config/db.js";

const CourseModel = {
  // Create a new course
  async create({ title, description, instructor_id, category_id, thumbnail_url, price = 0 }) {
    const { rows } = await query(
      `INSERT INTO courses 
      (title, description, instructor_id, category_id, thumbnail_url, price) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *`,
      [title, description, instructor_id, category_id, thumbnail_url, price]
    );
    return rows[0];
  },

  // Get all courses with optional filters
  async findAll({ category_id, instructor_id, is_featured, is_published, search, limit = 10, offset = 0 } = {}) {
    let sql = `
      SELECT c.*, u.name as instructor_name, cat.name as category_name,
      COUNT(DISTINCT e.id) as enrollment_count
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.id
      LEFT JOIN categories cat ON c.category_id = cat.id
      LEFT JOIN enrollments e ON c.id = e.course_id
    `;
    
    const values = [];
    const conditions = [];
    
    // Add filters if provided
    if (category_id) {
      values.push(category_id);
      conditions.push(`c.category_id = $${values.length}`);
    }
    
    if (instructor_id) {
      values.push(instructor_id);
      conditions.push(`c.instructor_id = $${values.length}`);
    }
    
    if (is_featured !== undefined) {
      values.push(is_featured);
      conditions.push(`c.is_featured = $${values.length}`);
    }
    
    if (is_published !== undefined) {
      values.push(is_published);
      conditions.push(`c.is_published = $${values.length}`);
    }
    
    if (search) {
      values.push(`%${search}%`);
      conditions.push(`(LOWER(c.title) LIKE LOWER($${values.length}) OR LOWER(c.description) LIKE LOWER($${values.length}))`);
    }
    
    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    sql += ` GROUP BY c.id, u.name, cat.name`;
    sql += ` ORDER BY c.created_at DESC`;
    sql += ` LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    
    values.push(limit, offset);
    
    const { rows } = await query(sql, values);
    return rows;
  },

  // Get a course by ID with detailed information
  async findById(id) {
    const { rows } = await query(
      `SELECT c.*, u.name as instructor_name, cat.name as category_name,
      COUNT(DISTINCT e.id) as enrollment_count
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.id
      LEFT JOIN categories cat ON c.category_id = cat.id
      LEFT JOIN enrollments e ON c.id = e.course_id
      WHERE c.id = $1
      GROUP BY c.id, u.name, cat.name`,
      [id]
    );
    return rows[0];
  },

  // Update a course
  async update({ id, title, description, category_id, thumbnail_url, price, is_featured, is_published }) {
    const updates = [];
    const values = [];
    
    if (title !== undefined) {
      values.push(title);
      updates.push(`title = $${values.length}`);
    }
    
    if (description !== undefined) {
      values.push(description);
      updates.push(`description = $${values.length}`);
    }
    
    if (category_id !== undefined) {
      values.push(category_id);
      updates.push(`category_id = $${values.length}`);
    }
    
    if (thumbnail_url !== undefined) {
      values.push(thumbnail_url);
      updates.push(`thumbnail_url = $${values.length}`);
    }
    
    if (price !== undefined) {
      values.push(price);
      updates.push(`price = $${values.length}`);
    }
    
    if (is_featured !== undefined) {
      values.push(is_featured);
      updates.push(`is_featured = $${values.length}`);
    }
    
    if (is_published !== undefined) {
      values.push(is_published);
      updates.push(`is_published = $${values.length}`);
    }
    
    // Add updated_at timestamp
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    
    if (updates.length === 0) {
      return await this.findById(id);
    }
    
    values.push(id);
    
    const { rows } = await query(
      `UPDATE courses SET ${updates.join(', ')} WHERE id = $${values.length} RETURNING *`,
      values
    );
    
    return rows[0];
  },

  // Delete a course
  async delete(id) {
    await query('DELETE FROM courses WHERE id = $1', [id]);
    return { success: true };
  },

  // Get courses by instructor
  async findByInstructor(instructorId) {
    const { rows } = await query(
      `SELECT c.*, COUNT(e.id) as enrollment_count 
       FROM courses c 
       LEFT JOIN enrollments e ON c.id = e.course_id 
       WHERE c.instructor_id = $1 
       GROUP BY c.id 
       ORDER BY c.created_at DESC`,
      [instructorId]
    );
    return rows;
  }
};

export default CourseModel;