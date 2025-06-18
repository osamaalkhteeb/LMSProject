import apiClient from './apiClient.js';

// Create assignment (Instructor/Admin only)
export const createAssignment = async (lessonId, assignmentData) => {
  try {
    const response = await apiClient.post(`/lessons/${lessonId}/assignments`, assignmentData);
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error creating assignment:', error);
    throw error;
  }
};

// Get assignments for a lesson
export const getAssignmentsByLesson = async (lessonId) => {
  try {
    const response = await apiClient.get(`/assignments/lessons/${lessonId}`);
    return response.data?.data || [];
  } catch (error) {
    console.error(`Error fetching assignments for lesson ${lessonId}:`, error);
    throw error;
  }
};

// Get assignment by ID
export const getAssignment = async (id) => {
  try {
    const response = await apiClient.get(`/assignments/${id}`);
    return response.data?.data || response.data;
  } catch (error) {
    console.error(`Error fetching assignment ${id}:`, error);
    throw error;
  }
};

// Update assignment (Instructor/Admin only)
export const updateAssignment = async (id, assignmentData) => {
  try {
    const response = await apiClient.put(`/assignments/${id}`, assignmentData);
    return response.data?.data || response.data;
  } catch (error) {
    console.error(`Error updating assignment ${id}:`, error);
    throw error;
  }
};

// Delete assignment (Instructor/Admin only)
export const deleteAssignment = async (id) => {
  try {
    const response = await apiClient.delete(`/assignments/${id}`);
    return response.data?.data || response.data;
  } catch (error) {
    console.error(`Error deleting assignment ${id}:`, error);
    throw error;
  }
};

// Submit assignment (Student only)
export const submitAssignment = async (id, submissionData) => {
  try {
    const response = await apiClient.post(`/assignments/${id}/submit`, submissionData);
    return response.data?.data || response.data;
  } catch (error) {
    console.error(`Error submitting assignment ${id}:`, error);
    throw error;
  }
};

// Get submissions for an assignment (Instructor/Admin only)
export const getAssignmentSubmissions = async (id) => {
  try {
    const response = await apiClient.get(`/assignments/${id}/submissions`);
    return response.data?.data || [];
  } catch (error) {
    console.error(`Error fetching submissions for assignment ${id}:`, error);
    throw error;
  }
};

// Grade a submission (Instructor/Admin only)
export const gradeSubmission = async (submissionId, gradeData) => {
  try {
    const response = await apiClient.put(`/submissions/${submissionId}/grade`, gradeData);
    return response.data?.data || response.data;
  } catch (error) {
    console.error(`Error grading submission ${submissionId}:`, error);
    throw error;
  }
};

// Delete submission (Student only)
export const deleteSubmission = async (id) => {
  try {
    const response = await apiClient.delete(`/assignments/${id}/submit`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting submission for assignment ${id}:`, error);
    throw error;
  }
};

export default {
  createAssignment,
  getAssignmentsByLesson,
  getAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  deleteSubmission,
  getAssignmentSubmissions,
  gradeSubmission
};