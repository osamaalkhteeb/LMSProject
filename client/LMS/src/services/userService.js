import apiClient from './apiClient.js';

// Profile routes (authenticated users)
export const getUserProfile = async () => {
  try {
    const response = await apiClient.get('/users/profile');
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const response = await apiClient.put('/users/profile', profileData);
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const uploadProfileImage = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await apiClient.post('/users/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw error;
  }
};

export const changePassword = async (passwordData) => {
  try {
    const response = await apiClient.put('/users/change-password', passwordData);
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

// Admin routes
export const getAllUsers = async () => {
  try {
    const response = await apiClient.get('/users/admin/users');
    return response.data?.data?.users || response.data?.data || [];
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw error;
  }
};

export const getUserById = async (userId) => {
  try {
    const response = await apiClient.get(`/users/admin/users/${userId}`);
    return response.data?.data || response.data;
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error);
    throw error;
  }
};

export const updateUserById = async (userId, userData) => {
  try {
    const response = await apiClient.put(`/users/${userId}`, userData);
    return response.data?.data || response.data;
  } catch (error) {
    console.error(`Error updating user ${userId}:`, error);
    throw error;
  }
};

// Delete user (Admin only)
export const deleteUser = async (userId) => {
  const response = await apiClient.delete(`/users/admin/users/${userId}`);
  return response.data;
};

// Get user statistics (Admin only)
export const getUserStats = async () => {
  const response = await apiClient.get('/users/stats');
  return response.data;
};

export default {
  getUserProfile,
  updateUserProfile,
  uploadProfileImage,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUser,
  getUserStats
};