import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { success, error } from "../utils/response";
import { paginate } from "../utils/pagination";

export const addMedicine = async (req: AuthRequest, res: Response) => {
    try {
        const { name, description, price, stock, image, categoryId } = req.body;

        // Check if category exists
        const category = await prisma.category.findUnique({ where: { id: categoryId } });
        if (!category) return res.status(404).json(error("Category not found"));

        const medicine = await prisma.medicine.create({
            data: {
                name,
                description,
                price,
                stock,
                image,
                categoryId,
                sellerId: req.user!.id,
            },
            include: { category: true },
        });

        res.status(201).json(success(medicine, "Medicine added"));
    } catch (e) {
        res.status(500).json(error("Failed to add medicine"));
    }
};

export const getSellerMedicines = async (req: AuthRequest, res: Response) => {
    try {
        const { page, limit } = req.query;
        const { skip, take } = paginate(Number(page), Number(limit));

        const [medicines, total] = await Promise.all([
            prisma.medicine.findMany({
                where: { sellerId: req.user!.id },
                include: { category: true },
                skip,
                take,
                orderBy: { createdAt: "desc" },
            }),
            prisma.medicine.count({ where: { sellerId: req.user!.id } }),
        ]);

        res.json(success({ medicines, total }));
    } catch (e) {
        res.status(500).json(error("Failed to fetch medicines"));
    }
};

export const updateMedicine = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const medicine = await prisma.medicine.findUnique({ where: { id } });

        if (!medicine) return res.status(404).json(error("Medicine not found"));
        if (medicine.sellerId !== req.user!.id) return res.status(403).json(error("Forbidden"));

        const updated = await prisma.medicine.update({
            where: { id },
            data: req.body,
            include: { category: true },
        });

        res.json(success(updated, "Medicine updated"));
    } catch (e) {
        res.status(500).json(error("Failed to update medicine"));
    }
};

export const deleteMedicine = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const medicine = await prisma.medicine.findUnique({ where: { id } });

        if (!medicine) return res.status(404).json(error("Medicine not found"));
        if (medicine.sellerId !== req.user!.id) return res.status(403).json(error("Forbidden"));

        await prisma.medicine.delete({ where: { id } });

        res.json(success(null, "Medicine deleted"));
    } catch (e) {
        res.status(500).json(error("Failed to delete medicine"));
    }
};

export const getSellerOrders = async (req: AuthRequest, res: Response) => {
    try {
        const { page, limit } = req.query;
        const { skip, take } = paginate(Number(page), Number(limit));

        const where = {
            items: { some: { medicine: { sellerId: req.user!.id } } },
        };

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                include: {
                    items: {
                        include: { medicine: true },
                        where: { medicine: { sellerId: req.user!.id } },
                    },
                    customer: { select: { name: true, email: true } },
                },
                skip,
                take,
                orderBy: { createdAt: "desc" },
            }),
            prisma.order.count({ where }),
        ]);

        res.json(success({ orders, total }));
    } catch (e) {
        res.status(500).json(error("Failed to fetch orders"));
    }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const order = await prisma.order.findUnique({
            where: { id },
            include: { items: { include: { medicine: true } } },
        });

        if (!order) return res.status(404).json(error("Order not found"));

        // Check if seller has items in this order
        const hasItems = order.items.some(item => item.medicine.sellerId === req.user!.id);
        if (!hasItems) return res.status(403).json(error("Forbidden"));

        const updated = await prisma.order.update({
            where: { id },
            data: { status },
        });

        res.json(success(updated, "Status updated"));
    } catch (e) {
        res.status(500).json(error("Failed to update status"));
    }
};
