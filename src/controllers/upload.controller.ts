import { Request, Response } from 'express';
import { cloudinary } from '../lib/cloudinary.js';

// Upload controller
export const uploadImage = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }

        // Cloudinary returns the file URL in `path` or `secure_url`
        // With multer-storage-cloudinary, req.file.path is the remote URL
        const imageUrl = req.file.path;

        res.json({
            success: true,
            data: {
                filename: req.file.filename,
                originalName: req.file.originalname,
                size: req.file.size,
                mimetype: req.file.mimetype,
                url: imageUrl
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to upload file'
        });
    }
};

// Upload multiple images
export const uploadMultipleImages = async (req: Request, res: Response) => {
    try {
        if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No files uploaded'
            });
        }

        const files = (req.files as Express.Multer.File[]).map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            size: file.size,
            mimetype: file.mimetype,
            url: file.path // Cloudinary URL
        }));

        res.json({
            success: true,
            data: files
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to upload files'
        });
    }
};

// Delete image
export const deleteImage = async (req: Request, res: Response) => {
    try {
        const { filename } = req.params;

        // Ensure filename is provided
        if (!filename) {
            return res.status(400).json({ success: false, error: 'Filename is required' });
        }

        // For Cloudinary, we need the public_id.
        // Assuming filename passed here is the public_id or we need to extract it.
        // However, standard delete might differ.
        // Let's assume the frontend passes the public_id or we parse it from URL if stored differently.
        // For simplicity in this setup, let's try to delete by the "filename" which is usually the public_id in Cloudinary storage.

        await cloudinary.uploader.destroy(filename);

        res.json({
            success: true,
            message: 'File deleted successfully'
        });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete file'
        });
    }
};

// Error handling middleware for multer
export const handleMulterError = (err: any, req: Request, res: Response, next: any) => {
    if (err) {
        return res.status(400).json({
            success: false,
            error: err.message
        });
    }
    next();
};
