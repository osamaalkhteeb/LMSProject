import multer from 'multer';
import path from 'path';

// Configure storage for temporary file uploads
const storage = multer.memoryStorage();

// File filter for images (profiles and course thumbnails)
const imageFileFilter = (req, file, cb) => {
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  
  if (allowedImageTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, gif) are allowed!'), false);
  }
};

// File filter for Word documents (assignments)
const documentFileFilter = (req, file, cb) => {
  const allowedDocumentTypes = [
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx\
  ];
  
  if (allowedDocumentTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only Word documents (.doc, .docx) are allowed!'), false);
  }
};

// Configure multer for image uploads
const uploadImage = multer({
  storage: storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});

// Configure multer for document uploads
const uploadDocument = multer({
  storage: storage,
  fileFilter: documentFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size for documents
  },
});

// Export both configurations
export { uploadImage, uploadDocument };
export default uploadImage; // Keep default export for backward compatibility