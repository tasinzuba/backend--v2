import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { prisma } from "../lib/prisma.js";
import { success, error } from "../utils/response.js";
import { paginate } from "../utils/pagination.js";

export const getManagerStats = async (req: AuthRequest, res: Response) => {
    try {
        const [totalOrders, pending, processing, shipped, delivered, revenue] = await Promise.all([
            prisma.order.count(),
            prisma.order.count({ where: { status: "PENDING" } }),
            prisma.order.count({ where: { status: "PROCESSING" } }),
            prisma.order.count({ where: { status: "SHIPPED" } }),
            prisma.order.count({ where: { status: "DELIVERED" } }),
            prisma.order.aggregate({ _sum: { totalPrice: true }, where: { status: "DELIVERED" } }),
        ]);

        res.json(success({
            totalOrders,
            pending,
            processing,
            shipped,
            delivered,
            revenue: revenue._sum.totalPrice || 0,
        }));
    } catch (e) {
        res.status(500).json(error("Failed to fetch manager stats"));
    }
};

export const getManagerOrders = async (req: AuthRequest, res: Response) => {
    try {
        const { page, limit } = req.query;
        const { skip, take } = paginate(Number(page), Number(limit));

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                skip,
                take,
                orderBy: { createdAt: "desc" },
                include: {
                    customer: { select: { name: true, email: true } },
                    items: { include: { medicine: { select: { name: true, price: true } } } },
                },
            }),
            prisma.order.count(),
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

        const validStatuses = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json(error("Invalid order status"));
        }

        const order = await prisma.order.findUnique({ where: { id: id as string } });
        if (!order) return res.status(404).json(error("Order not found"));

        const updated = await prisma.order.update({
            where: { id: id as string },
            data: { status },
        });

        res.json(success(updated, "Order status updated"));
    } catch (e) {
        res.status(500).json(error("Failed to update order status"));
    }
};

export const getManagerMedicines = async (req: AuthRequest, res: Response) => {
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
