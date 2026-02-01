import { Router } from 'express';
import { uploadImage, uploadMultipleImages, deleteImage, handleMulterError } from '../controllers/upload.controller.js';
import { upload } from '../lib/cloudinary.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

// Single image upload (requires auth)
router.post('/single', requireAuth, upload.single('image'), handleMulterError, uploadImage);

// Multiple images upload (max 5, requires auth)
router.post('/multiple', requireAuth, upload.array('images', 5), handleMulterError, uploadMultipleImages);

// Delete image (requires auth)
router.delete('/:filename', requireAuth, deleteImage);

export default router;
