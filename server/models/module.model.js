import { query } from "../config/db.js";

const ModuleModel = {
  // Create a new module
  async createModule({ courseId, title, description, orderNum }) {
    const { rows } = await query(
      `INSERT INTO modules (course_id, title, description, order_num)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [courseId, title, description, orderNum]
    );
    return rows[0];
  },

  // Get all modules for a course (with lessons, assignments, and quizzes)
  async getModulesByCourseId(courseId) {
    const { rows: modules } = await query(
      `SELECT * FROM modules 
         WHERE course_id = $1 
         ORDER BY order_num`,
      [courseId]
    );

    // Populate lessons, assignments, and quizzes for each module
    for (const module of modules) {
      // Get lessons
      const { rows: lessons } = await query(
        `SELECT id, title, content_type, content_url, duration
         FROM lessons 
         WHERE module_id = $1
         ORDER BY order_num`,
        [module.id]
      );
      module.lessons = lessons;
      
      // Get assignments for this module (only from lessons with assignment content_type)
      const { rows: assignments } = await query(
        `SELECT a.id, a.title, a.description, a.deadline, a.lesson_id
         FROM assignments a
         JOIN lessons l ON a.lesson_id = l.id
         WHERE l.module_id = $1 AND l.content_type = 'assignment'
         ORDER BY a.deadline`,
        [module.id]
      );
      module.assignments = assignments;
      
      // Get quizzes for this module (only from lessons with quiz content_type)
      const { rows: quizzes } = await query(
        `SELECT q.id, q.title, q.lesson_id
         FROM quizzes q
         JOIN lessons l ON q.lesson_id = l.id
         WHERE l.module_id = $1 AND l.content_type = 'quiz'
         ORDER BY q.id`,
        [module.id]
      );
      module.quizzes = quizzes;
    }
    return modules;
  },

  // Get a single module by ID
  async getById(moduleId) {
    const { rows: [module] } = await query(
      `SELECT * FROM modules WHERE id = $1`,
      [moduleId]
    );
    
    if (module) {
      // Get lessons
      const { rows: lessons } = await query(
        `SELECT id, title, content_type, content_url, duration
         FROM lessons 
         WHERE module_id = $1
         ORDER BY order_num`,
        [module.id]
      );
      module.lessons = lessons;
      
      // Get assignments for this module (only from lessons with assignment content_type)
      const { rows: assignments } = await query(
        `SELECT a.id, a.title, a.description, a.deadline, a.lesson_id
         FROM assignments a
         JOIN lessons l ON a.lesson_id = l.id
         WHERE l.module_id = $1 AND l.content_type = 'assignment'
         ORDER BY a.deadline`,
        [module.id]
      );
      module.assignments = assignments;
      
      // Get quizzes for this module (only from lessons with quiz content_type)
      const { rows: quizzes } = await query(
        `SELECT q.id, q.title, q.lesson_id
         FROM quizzes q
         JOIN lessons l ON q.lesson_id = l.id
         WHERE l.module_id = $1 AND l.content_type = 'quiz'
         ORDER BY q.id`,
        [module.id]
      );
      module.quizzes = quizzes;
    }
    
    return module;
  },

  // Update a module
  // Update a module
  async update(moduleId, { title, description, orderNum }) {
    const { rows: [updatedModule] } = await query(
      `UPDATE modules
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           order_num = COALESCE($3, order_num)
       WHERE id = $4
       RETURNING *`,
      [title, description, orderNum, moduleId]
    );
    
    return updatedModule;
  },

  // Delete a module
  async delete(moduleId) {
    // First check if module has lessons
    const { rows: lessons } = await query(
      `SELECT id FROM lessons WHERE module_id = $1`,
      [moduleId]
    );
    
    // Start transaction
    await query('BEGIN');
    
    try {
      // Delete all lessons in this module
      if (lessons.length > 0) {
        // Delete any quizzes associated with lessons
        await query(
          `DELETE FROM quizzes WHERE lesson_id IN (
            SELECT id FROM lessons WHERE module_id = $1
          )`,
          [moduleId]
        );
        
        // Delete any assignments associated with lessons
        await query(
          `DELETE FROM assignments WHERE lesson_id IN (
            SELECT id FROM lessons WHERE module_id = $1
          )`,
          [moduleId]
        );
        
        // Delete lesson completions
        await query(
          `DELETE FROM lesson_completions WHERE lesson_id IN (
            SELECT id FROM lessons WHERE module_id = $1
          )`,
          [moduleId]
        );
        
        // Delete lessons
        await query(
          `DELETE FROM lessons WHERE module_id = $1`,
          [moduleId]
        );
      }
      
      // Delete the module
      const { rowCount } = await query(
        `DELETE FROM modules WHERE id = $1`,
        [moduleId]
      );
      
      await query('COMMIT');
      return rowCount > 0;
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  }
};

export default ModuleModel;
