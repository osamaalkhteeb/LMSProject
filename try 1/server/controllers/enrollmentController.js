import EnrollmentModel from "../models/enrollmentModel.js";

const EnrollmentController = {
  // Enroll in a course
  async enrollInCourse(req, res, next) {
    try {
      const { course_id } = req.body;
      const user_id = req.user.id;
      
      if (!course_id) {
        return res.status(400).json({ success: false, message: "Course ID is required" });
      }
      
      const enrollment = await EnrollmentModel.create({ user_id, course_id });
      res.status(201).json({ success: true, enrollment });
    } catch (error) {
      next(error);
    }
  },

  // Get enrollment by ID
  async getEnrollment(req, res, next) {
    try {
      const { id } = req.params;
      const enrollment = await EnrollmentModel.findById(id);
      
      if (!enrollment) {
        return res.status(404).json({ success: false, message: "Enrollment not found" });
      }
      
      // Check if user is authorized to view this enrollment
      if (enrollment.user_id !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'instructor') {
        return res.status(403).json({ success: false, message: "Not authorized to view this enrollment" });
      }
      
      res.json({ success: true, enrollment });
    } catch (error) {
      next(error);
    }
  },

  // Get user enrollments
  async getUserEnrollments(req, res, next) {
    try {
      const userId = req.params.userId || req.user.id;
      
      // Only allow users to view their own enrollments unless admin
      if (userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: "Not authorized to view these enrollments" });
      }
      
      const enrollments = await EnrollmentModel.findByUser(userId);
      res.json({ success: true, enrollments });
    } catch (error) {
      next(error);
    }
  },

  // Get course enrollments (for instructors)
  async getCourseEnrollments(req, res, next) {
    try {
      const { courseId } = req.params;
      
      // Check if user is the course instructor or admin
      // In a real app, you'd check if the user is the instructor of this specific course
      if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: "Not authorized to view these enrollments" });
      }
      
      const enrollments = await EnrollmentModel.findByCourse(courseId);
      res.json({ success: true, enrollments });
    } catch (error) {
      next(error);
    }
  },

  // Update enrollment progress
  async updateProgress(req, res, next) {
    try {
      const { id } = req.params;
      const { progress } = req.body;
      
      if (progress === undefined || progress < 0 || progress > 100) {
        return res.status(400).json({ success: false, message: "Valid progress value (0-100) is required" });
      }
      
      // Check if enrollment exists and belongs to user
      const existingEnrollment = await EnrollmentModel.findById(id);
      
      if (!existingEnrollment) {
        return res.status(404).json({ success: false, message: "Enrollment not found" });
      }
      
      if (existingEnrollment.user_id !== req.user.id) {
        return res.status(403).json({ success: false, message: "Not authorized to update this enrollment" });
      }
      
      const enrollment = await EnrollmentModel.updateProgress({ id, progress });
      res.json({ success: true, enrollment });
    } catch (error) {
      next(error);
    }
  }
};

export default EnrollmentController;