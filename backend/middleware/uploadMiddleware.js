import multer from 'multer';
import { getCloudinary } from '../config/cloudinary.js';

// Memory storage so files aren't saved locally
const storage = multer.memoryStorage();

// Multer upload instance (Max 5MB file limit, images only)
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

/**
 * Upload buffer directly to Cloudinary
 * @param {Buffer} buffer - File buffer
 * @param {string} folder - Destination folder on Cloudinary
 * @returns {Promise<string>} Secure URL of uploaded image
 */
export const uploadToCloudinary = (buffer, folder = 'tastebuds') => {
  return new Promise((resolve, reject) => {
    const cloudinaryInstance = getCloudinary();
    const stream = cloudinaryInstance.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
};
