import { Response } from "express";
import { prisma } from "../lib/prisma.js";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { success, error } from "../utils/response.js";
import { paginate } from "../utils/pagination.js";

export const getStats = async (req: AuthRequest, res: Response) => {
    try {
        const [users, customers, sellers, medicines, orders, revenue] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { role: "CUSTOMER" } }),
            prisma.user.count({ where: { role: "SELLER" } }),
            prisma.medicine.count(),
            prisma.order.count(),
            prisma.order.aggregate({ _sum: { totalPrice: true }, where: { status: "DELIVERED" } }),
        ]);

        res.json(success({
            users,
            customers,
            sellers,
            medicines,
            orders,
            revenue: revenue._sum.totalPrice || 0,
        }));
    } catch (e) {
        res.status(500).json(error("Failed to fetch stats"));
    }
};

export const getUsers = async (req: AuthRequest, res: Response) => {
    try {
        const { page, limit, role } = req.query;
        const { skip, take } = paginate(Number(page), Number(limit));
        const where: any = role ? { role: String(role) } : {};

        const [users, total] = await Promise.all([
            prisma.user.findMany({ where, skip, take, orderBy: { createdAt: "desc" } }),
            prisma.user.count({ where }),
        ]);

        res.json(success({ users, total }));
    } catch (e) {
        res.status(500).json(error("Failed to fetch users"));
    }
};

export const updateUserStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const user = await prisma.user.findUnique({ where: { id: id as string } });
        if (!user) return res.status(404).json(error("User not found"));
        if (user.role === "ADMIN") return res.status(400).json(error("Cannot update admin"));

        const updated = await prisma.user.update({
            where: { id: id as string },
            data: { status },
        });

        res.json(success(updated, "User status updated"));
    } catch (e) {
        res.status(500).json(error("Failed to update user"));
    }
};

export const createCategory = async (req: AuthRequest, res: Response) => {
    try {
        const { name, description, image } = req.body;
        const category = await prisma.category.create({
            data: { name, description, image },
        });
        res.status(201).json(success(category, "Category created"));
    } catch (e) {
        res.status(500).json(error("Failed to create category"));
    }
};

export const updateCategory = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const category = await prisma.category.update({
            where: { id: id as string },
            data: req.body,
        });
        res.json(success(category, "Category updated"));
    } catch (e) {
        res.status(500).json(error("Failed to update category"));
    }
};

export const deleteCategory = async (req: AuthRequest, res: Response) => {
    try {
        await prisma.category.delete({ where: { id: req.params.id as string } });
        res.json(success(null, "Category deleted"));
    } catch (e) {
        res.status(500).json(error("Failed to delete category"));
    }
};

export const getOrders = async (req: AuthRequest, res: Response) => {
    try {
        const { page, limit } = req.query;
        const { skip, take } = paginate(Number(page), Number(limit));

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                skip,
                take,
                orderBy: { createdAt: "desc" },
                include: { customer: { select: { name: true, email: true } } }
            }),
            prisma.order.count(),
        ]);

        res.json(success({ orders, total }));
    } catch (e) {
        res.status(500).json(error("Failed to fetch orders"));
    }
};

export const getAllMedicines = async (req: AuthRequest, res: Response) => {
    try {
        const { page, limit } = req.query;
        const { skip, take } = paginate(Number(page), Number(limit));

        const [medicines, total] = await Promise.all([
            prisma.medicine.findMany({
                skip,
                take,
                orderBy: { createdAt: "desc" },
                include: { category: true, seller: { select: { name: true } } }
            }),
            prisma.medicine.count(),
        ]);

        res.json(success({ medicines, total }));
    } catch (e) {
        res.status(500).json(error("Failed to fetch medicines"));
    }
};
