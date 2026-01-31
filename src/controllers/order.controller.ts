import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { success, error } from "../utils/response";
import { paginate } from "../utils/pagination";

export const createOrder = async (req: AuthRequest, res: Response) => {
    try {
        const { items, shippingAddress } = req.body;

        if (!items?.length) return res.status(400).json(error("Items required"));
        if (!shippingAddress) return res.status(400).json(error("Address required"));

        let totalPrice = 0;
        const orderItems = [];

        for (const item of items) {
            const medicine = await prisma.medicine.findUnique({
                where: { id: item.medicineId },
            });

            if (!medicine) return res.status(404).json(error(`Medicine not found`));
            if (medicine.stock < item.quantity) return res.status(400).json(error(`Insufficient stock for ${medicine.name}`));

            totalPrice += medicine.price * item.quantity;
            orderItems.push({
                medicineId: item.medicineId,
                quantity: item.quantity,
                price: medicine.price,
            });
        }

        const order = await prisma.order.create({
            data: {
                customerId: req.user!.id,
                totalPrice,
                shippingAddress,
                items: { createMany: { data: orderItems } },
            },
            include: { items: { include: { medicine: true } } },
        });

        for (const item of items) {
            await prisma.medicine.update({
                where: { id: item.medicineId },
                data: { stock: { decrement: item.quantity } },
            });
        }

        res.status(201).json(success(order, "Order created"));
    } catch (e) {
        res.status(500).json(error("Failed to create order"));
    }
};

export const getMyOrders = async (req: AuthRequest, res: Response) => {
    try {
        const { page, limit } = req.query;
        const { skip, take } = paginate(Number(page), Number(limit));

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where: { customerId: req.user!.id },
                include: { items: { include: { medicine: true } } },
                skip,
                take,
                orderBy: { createdAt: "desc" },
            }),
            prisma.order.count({ where: { customerId: req.user!.id } }),
        ]);

        res.json(success({ orders, total }));
    } catch (e) {
        res.status(500).json(error("Failed to fetch orders"));
    }
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
    try {
        const order = await prisma.order.findUnique({
            where: { id: req.params.id as string },
            include: {
                items: { include: { medicine: true } },
                customer: { select: { id: true, name: true, email: true } },
            },
        });

        if (!order) return res.status(404).json(error("Order not found"));
        if (order.customerId !== req.user!.id && req.user!.role !== "ADMIN") {
            return res.status(403).json(error("Forbidden"));
        }

        res.json(success(order));
    } catch (e) {
        res.status(500).json(error("Failed to fetch order"));
    }
};
