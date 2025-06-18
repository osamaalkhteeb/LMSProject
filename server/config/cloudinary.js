import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary with credentials from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload an image to Cloudinary
 * @param {string} imagePath - The path, URL or base64 string of the image to upload
 * @param {Object} options - Additional options for the upload
 * @returns {Promise<Object>} - The upload result containing URLs and metadata
 */
export const uploadImage = async (imagePath, options = {}) => {
  try {
    // Set default folder if not specified in options
    const uploadOptions = {
      folder: 'lms_uploads',
      ...options
    };
    
    // Upload the image to Cloudinary
    const result = await cloudinary.uploader.upload(imagePath, uploadOptions);
    return result;
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw error;
  }
};

/**
 * Upload a document to Cloudinary
 * @param {string} documentPath - The path, URL or base64 string of the document to upload
 * @param {Object} options - Additional options for the upload
 * @returns {Promise<Object>} - The upload result containing URLs and metadata
 */
export const uploadDocument = async (documentPath, options = {}) => {
  try {
    // Set default folder and resource type for documents
    const uploadOptions = {
      folder: 'lms_assignments',
      resource_type: 'raw', // Use 'raw' for non-image files
      ...options
    };
    
    // Upload the document to Cloudinary
    const result = await cloudinary.uploader.upload(documentPath, uploadOptions);
    return result;
  } catch (error) {
    console.error('Error uploading document to Cloudinary:', error);
    throw error;
  }
};

/**
 * Delete an image from Cloudinary
 * @param {string} publicId - The public ID of the image to delete
 * @returns {Promise<Object>} - The deletion result
 */
export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

/**
 * Delete a document from Cloudinary
 * @param {string} publicId - The public ID of the document to delete
 * @returns {Promise<Object>} - The deletion result
 */
export const deleteDocument = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'raw'
    });
    return result;
  } catch (error) {
    console.error('Error deleting document from Cloudinary:', error);
    throw error;
  }
};

export default cloudinary;