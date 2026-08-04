import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { upload, uploadToCloudinary } from '../middleware/uploadMiddleware.js';

const router = express.Router();

/**
 * @route POST /api/upload
 * @desc Upload an image file to Cloudinary
 * @access Private
 */
router.post('/', authMiddleware, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const imageUrl = await uploadToCloudinary(req.file.buffer, 'tastebuds_uploads');
    res.status(200).json({
      success: true,
      url: imageUrl,
      message: 'Image uploaded successfully to Cloudinary',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
