import { Request, Response } from 'express';
import { cloudinary } from '../lib/cloudinary.js';


export const uploadImage = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }

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
            url: file.path
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


export const deleteImage = async (req: Request, res: Response) => {
    try {
        const { filename } = req.params;

        if (!filename) {
            return res.status(400).json({ success: false, error: 'Filename is required' });
        }

        const publicId = Array.isArray(filename) ? filename[0] : filename;
        await cloudinary.uploader.destroy(publicId);

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


export const handleMulterError = (err: any, req: Request, res: Response, next: any) => {
    if (err) {
        return res.status(400).json({
            success: false,
            error: err.message
        });
    }
    next();
};
