import CourseModel from "../models/courseModel.js";

const CoursesController = {
  // Get all courses with optional filtering
  async getAllCourses(req, res, next) {
    try {
      const { category_id, instructor_id, featured, published, search, limit, offset } = req.query;
      
      const filters = {
        category_id: category_id ? parseInt(category_id) : undefined,
        instructor_id: instructor_id ? parseInt(instructor_id) : undefined,
        is_featured: featured === 'true' ? true : (featured === 'false' ? false : undefined),
        is_published: published === 'true' ? true : (published === 'false' ? false : undefined),
        search,
        limit: limit ? parseInt(limit) : 10,
        offset: offset ? parseInt(offset) : 0
      };
      
      const courses = await CourseModel.findAll(filters);
      res.json({ success: true, courses });
    } catch (error) {
      next(error);
    }
  },

  // Get a single course by ID
  async getCourseById(req, res, next) {
    try {
      const { id } = req.params;
      const course = await CourseModel.findById(id);
      
      if (!course) {
        return res.status(404).json({ success: false, message: "Course not found" });
      }
      
      res.json({ success: true, course });
    } catch (error) {
      next(error);
    }
  },

  // Create a new course
  async createCourse(req, res, next) {
    try {
      const { title, description, category_id, thumbnail_url, price } = req.body;
      const instructor_id = req.user.id; // Get instructor ID from authenticated user
      
      if (!title) {
        return res.status(400).json({ success: false, message: "Title is required" });
      }
      
      const course = await CourseModel.create({
        title,
        description,
        instructor_id,
        category_id,
        thumbnail_url,
        price
      });
      
      res.status(201).json({ success: true, course });
    } catch (error) {
      next(error);
    }
  },

  // Update a course
  async updateCourse(req, res, next) {
    try {
      const { id } = req.params;
      const { title, description, category_id, thumbnail_url, price, is_featured, is_published } = req.body;
      
      // Check if course exists and user is the instructor
      const existingCourse = await CourseModel.findById(id);
      
      if (!existingCourse) {
        return res.status(404).json({ success: false, message: "Course not found" });
      }
      
      // Only allow instructor or admin to update
      if (existingCourse.instructor_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: "Not authorized to update this course" });
      }
      
      const course = await CourseModel.update({
        id,
        title,
        description,
        category_id,
        thumbnail_url,
        price,
        is_featured,
        is_published
      });
      
      res.json({ success: true, course });
    } catch (error) {
      next(error);
    }
  },

  // Delete a course
  async deleteCourse(req, res, next) {
    try {
      const { id } = req.params;
      
      // Check if course exists and user is the instructor
      const existingCourse = await CourseModel.findById(id);
      
      if (!existingCourse) {
        return res.status(404).json({ success: false, message: "Course not found" });
      }
      
      // Only allow instructor or admin to delete
      if (existingCourse.instructor_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: "Not authorized to delete this course" });
      }
      
      await CourseModel.delete(id);
      
      res.json({ success: true, message: "Course deleted successfully" });
    } catch (error) {
      next(error);
    }
  },

  // Get courses by instructor
  async getInstructorCourses(req, res, next) {
    try {
      const instructorId = req.params.instructorId || req.user.id;
      const courses = await CourseModel.findByInstructor(instructorId);
      res.json({ success: true, courses });
    } catch (error) {
      next(error);
    }
  }
};

export default CoursesController;