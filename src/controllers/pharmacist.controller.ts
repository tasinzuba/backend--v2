import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { prisma } from "../lib/prisma.js";
import { success, error } from "../utils/response.js";
import { paginate } from "../utils/pagination.js";

export const getPharmacistStats = async (req: AuthRequest, res: Response) => {
    try {
        const [total, active, inactive, lowStock, categories] = await Promise.all([
            prisma.medicine.count(),
            prisma.medicine.count({ where: { isActive: true } }),
            prisma.medicine.count({ where: { isActive: false } }),
            prisma.medicine.count({ where: { stock: { lt: 10 } } }),
            prisma.category.count(),
        ]);

        res.json(success({
            total,
            active,
            inactive,
            lowStock,
            categories,
        }));
    } catch (e) {
        res.status(500).json(error("Failed to fetch pharmacist stats"));
    }
};

export const getPharmacistMedicines = async (req: AuthRequest, res: Response) => {
    try {
        const { page, limit } = req.query;
        const { skip, take } = paginate(Number(page), Number(limit));

        const [medicines, total] = await Promise.all([
            prisma.medicine.findMany({
                skip,
                take,
                orderBy: { createdAt: "desc" },
                include: {
                    category: true,
                    seller: { select: { name: true, email: true } },
                },
            }),
            prisma.medicine.count(),
        ]);

        res.json(success({ medicines, total }));
    } catch (e) {
        res.status(500).json(error("Failed to fetch medicines"));
    }
};

export const verifyMedicine = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const medicine = await prisma.medicine.findUnique({ where: { id: id as string } });
        if (!medicine) return res.status(404).json(error("Medicine not found"));

        const updated = await prisma.medicine.update({
            where: { id: id as string },
            data: { isActive: !medicine.isActive },
        });

        res.json(success(updated, `Medicine ${updated.isActive ? "verified" : "unverified"}`));
    } catch (e) {
        res.status(500).json(error("Failed to update medicine"));
    }
};

export const getPharmacistReviews = async (req: AuthRequest, res: Response) => {
    try {
        const { page, limit } = req.query;
        const { skip, take } = paginate(Number(page), Number(limit));

        const [reviews, total] = await Promise.all([
            prisma.review.findMany({
                skip,
                take,
                orderBy: { createdAt: "desc" },
                include: {
                    medicine: { select: { name: true, price: true, image: true } },
                    customer: { select: { name: true, email: true } },
                },
            }),
            prisma.review.count(),
        ]);

        res.json(success({ reviews, total }));
    } catch (e) {
        res.status(500).json(error("Failed to fetch reviews"));
    }
};
