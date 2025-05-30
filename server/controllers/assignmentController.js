import AssignmentModel from "../models/assignmentModel.js";

const AssignmentController = {
  // Create a new assignment (instructor only)
  async createAssignment(req, res, next) {
    try {
      const { lesson_id, title, description, deadline } = req.body;
      
      if (!lesson_id || !title) {
        return res.status(400).json({ success: false, message: "Lesson ID and title are required" });
      }
      
      // In a real app, check if user is instructor of the course containing this lesson
      if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: "Only instructors can create assignments" });
      }
      
      const assignment = await AssignmentModel.create({
        lesson_id,
        title,
        description,
        deadline
      });
      
      res.status(201).json({ success: true, assignment });
    } catch (error) {
      next(error);
    }
  },

  // Get assignment by ID
  async getAssignment(req, res, next) {
    try {
      const { id } = req.params;
      const assignment = await AssignmentModel.findById(id);
      
      if (!assignment) {
        return res.status(404).json({ success: false, message: "Assignment not found" });
      }
      
      res.json({ success: true, assignment });
    } catch (error) {
      next(error);
    }
  },

  // Get assignments by lesson
  async getLessonAssignments(req, res, next) {
    try {
      const { lessonId } = req.params;
      const assignments = await AssignmentModel.findByLesson(lessonId);
      res.json({ success: true, assignments });
    } catch (error) {
      next(error);
    }
  },

  // Update an assignment (instructor only)
  async updateAssignment(req, res, next) {
    try {
      const { id } = req.params;
      const { title, description, deadline } = req.body;
      
      // Check if assignment exists
      const existingAssignment = await AssignmentModel.findById(id);
      
      if (!existingAssignment) {
        return res.status(404).json({ success: false, message: "Assignment not found" });
      }
      
      // In a real app, check if user is instructor of the course containing this assignment
      if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: "Only instructors can update assignments" });
      }
      
      const assignment = await AssignmentModel.update({
        id,
        title,
        description,
        deadline
      });
      
      res.json({ success: true, assignment });
    } catch (error) {
      next(error);
    }
  },

  // Delete an assignment (instructor only)
  async deleteAssignment(req, res, next) {
    try {
      const { id } = req.params;
      
      // Check if assignment exists
      const existingAssignment = await AssignmentModel.findById(id);
      
      if (!existingAssignment) {
        return res.status(404).json({ success: false, message: "Assignment not found" });
      }
      
      // In a real app, check if user is instructor of the course containing this assignment
      if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: "Only instructors can delete assignments" });
      }
      
      await AssignmentModel.delete(id);
      
      res.json({ success: true, message: "Assignment deleted successfully" });
    } catch (error) {
      next(error);
    }
  },

  // Submit an assignment (student only)
  async submitAssignment(req, res, next) {
    try {
      const { id } = req.params;
      const { submission_url, comments } = req.body;
      const user_id = req.user.id;
      
      if (!submission_url) {
        return res.status(400).json({ success: false, message: "Submission URL is required" });
      }
      
      // Check if assignment exists
      const assignment = await AssignmentModel.findById(id);
      
      if (!assignment) {
        return res.status(404).json({ success: false, message: "Assignment not found" });
      }
      
      // In a real app, check if user is enrolled in the course containing this assignment
      
      const submission = await AssignmentModel.submitAssignment({
        assignment_id: id,
        user_id,
        submission_url,
        comments
      });
      
      res.status(201).json({ success: true, submission });
    } catch (error) {
      next(error);
    }
  },

  // Grade an assignment submission (instructor only)
  async gradeAssignment(req, res, next) {
    try {
      const { id } = req.params;
      const { grade, feedback } = req.body;
      
      if (grade === undefined || grade < 0 || grade > 100) {
        return res.status(400).json({ success: false, message: "Valid grade value (0-100) is required" });
      }
      
      // Check if submission exists
      const submission = await AssignmentModel.findSubmissionById(id);
      
      if (!submission) {
        return res.status(404).json({ success: false, message: "Submission not found" });
      }
      
      // In a real app, check if user is instructor of the course containing this assignment
      if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: "Only instructors can grade assignments" });
      }
      
      const gradedSubmission = await AssignmentModel.gradeSubmission({
        submission_id: id,
        grade,
        feedback
      });
      
      res.json({ success: true, submission: gradedSubmission });
    } catch (error) {
      next(error);
    }
  },

  // Get submissions for an assignment (instructor only)
  async getAssignmentSubmissions(req, res, next) {
    try {
      const { assignmentId } = req.params;
      
      // In a real app, check if user is instructor of the course containing this assignment
      if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: "Only instructors can view all submissions" });
      }
      
      const submissions = await AssignmentModel.findSubmissionsByAssignment(assignmentId);
      res.json({ success: true, submissions });
    } catch (error) {
      next(error);
    }
  },

  // Get user's submissions (student or instructor)
  async getUserSubmissions(req, res, next) {
    try {
      const userId = req.params.userId || req.user.id;
      
      // Only allow users to view their own submissions unless instructor/admin
      if (userId !== req.user.id && req.user.role !== 'instructor' && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: "Not authorized to view these submissions" });
      }
      
      const submissions = await AssignmentModel.findSubmissionsByUser(userId);
      res.json({ success: true, submissions });
    } catch (error) {
      next(error);
    }
  }
};

export default AssignmentController;