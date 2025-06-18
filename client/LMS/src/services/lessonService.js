import apiClient from './apiClient.js';

// Create lesson (Instructor/Admin only)
export const createLesson = async (moduleId, lessonData) => {
  try {
    const response = await apiClient.post(`/lessons/modules/${moduleId}/lessons`, lessonData);
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error creating lesson:', error);
    throw error;
  }
};

// Get lessons for a course (via modules)
export const getLessonsByCourse = async (courseId) => {
  try {
    const response = await apiClient.get(`/modules/courses/${courseId}/modules`);
    const modules = response.data?.data || [];
    // Extract lessons from all modules
    const lessons = modules.flatMap(module => module.lessons || []);
    return lessons;
  } catch (error) {
    console.error(`Error fetching lessons for course ${courseId}:`, error);
    throw error;
  }
};

// Get lessons by module
export const getLessonsByModule = async (moduleId) => {
  try {
    const response = await apiClient.get(`/modules/modules/${moduleId}`);
    return response.data?.data?.lessons || [];
  } catch (error) {
    console.error(`Error fetching lessons for module ${moduleId}:`, error);
    throw error;
  }
};

// Get lesson by ID
export const getLesson = async (id) => {
  try {
    const response = await apiClient.get(`/lessons/lessons/${id}`);
    return response.data?.data || response.data;
  } catch (error) {
    console.error(`Error fetching lesson ${id}:`, error);
    throw error;
  }
};

// Update lesson (Instructor/Admin only)
export const updateLesson = async (id, lessonData) => {
  try {
    const response = await apiClient.put(`/lessons/lessons/${id}`, lessonData);
    return response.data?.data || response.data;
  } catch (error) {
    console.error(`Error updating lesson ${id}:`, error);
    throw error;
  }
};

// Delete lesson (Instructor/Admin only)
export const deleteLesson = async (id) => {
  try {
    const response = await apiClient.delete(`/lessons/lessons/${id}`);
    return response.data?.data || response.data;
  } catch (error) {
    console.error(`Error deleting lesson ${id}:`, error);
    throw error;
  }
};

export default {
  createLesson,
  getLessonsByCourse,
  getLessonsByModule,
  getLesson,
  updateLesson,
  deleteLesson
};