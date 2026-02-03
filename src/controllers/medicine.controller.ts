import { Response } from "express";
import { prisma } from "../lib/prisma.js";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { success, error } from "../utils/response.js";
import { paginate } from "../utils/pagination.js";

export const getAllMedicines = async (req: AuthRequest, res: Response) => {
    try {
        const { category, search, minPrice, maxPrice, page, limit } = req.query;
        const { skip, take } = paginate(Number(page), Number(limit));

        const where: any = { isActive: true };

        if (search) {
            where.OR = [
                { name: { contains: String(search), mode: "insensitive" } },
                { description: { contains: String(search), mode: "insensitive" } },
            ];
        }

        if (category) where.categoryId = String(category);
        if (minPrice && !isNaN(Number(minPrice))) where.price = { ...where.price, gte: Number(minPrice) };
        if (maxPrice && !isNaN(Number(maxPrice))) where.price = { ...where.price, lte: Number(maxPrice) };

        const [medicines, total] = await Promise.all([
            prisma.medicine.findMany({
                where,
                include: {
                    category: true,
                    seller: { select: { id: true, name: true } },
                },
                skip,
                take,
                orderBy: { createdAt: "desc" },
            }),
            prisma.medicine.count({ where }),
        ]);

        const backendUrl = process.env.BETTER_AUTH_URL || `http://${req.headers.host}`;
        const mappedMedicines = medicines.map(med => ({
            ...med,
            image: med.image?.replace("http://localhost:3001", backendUrl.replace(/\/$/, ""))
        }));

        res.json(success({ medicines: mappedMedicines, total, page: Number(page) || 1, limit: take }));
    } catch (e: any) {
        console.error("Error in getAllMedicines:", e);
        res.status(500).json(error(e.message || "Failed to fetch medicines"));
    }
};

export const getMedicineById = async (req: AuthRequest, res: Response) => {
    try {
        const medicine = await prisma.medicine.findUnique({
            where: { id: req.params.id as string },
            include: {
                category: true,
                seller: { select: { id: true, name: true } },
                reviews: { include: { customer: { select: { id: true, name: true } } } },
            },
        });

        if (!medicine) return res.status(404).json(error("Medicine not found"));

        const backendUrl = process.env.BETTER_AUTH_URL || `http://${req.headers.host}`;
        const mappedMedicine = {
            ...medicine,
            image: medicine.image?.replace("http://localhost:3001", backendUrl.replace(/\/$/, ""))
        };

        res.json(success(mappedMedicine));
    } catch (e) {
        console.error("Error in getMedicineById:", e);
        res.status(500).json(error("Failed to fetch medicine"));
    }
};

export const getCategories = async (req: AuthRequest, res: Response) => {
    try {
        const categories = await prisma.category.findMany({
            include: { _count: { select: { medicines: true } } },
            orderBy: { name: "asc" },
        });

        const backendUrl = process.env.BETTER_AUTH_URL || `http://${req.headers.host}`;
        const mappedCategories = categories.map(cat => ({
            ...cat,
            image: cat.image?.replace("http://localhost:3001", backendUrl.replace(/\/$/, ""))
        }));

        res.json(success(mappedCategories));
    } catch (e) {
        console.error("Error in getCategories:", e);
        res.status(500).json(error("Failed to fetch categories"));
    }
};
