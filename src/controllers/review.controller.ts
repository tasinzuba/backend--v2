import { Response } from "express";
import { prisma } from "../lib/prisma.js";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { success, error } from "../utils/response.js";

export const createReview = async (req: AuthRequest, res: Response) => {
    try {
        const { medicineId, rating, comment } = req.body;
        const customerId = req.user!.id;

        // Check if user bought the medicine (optional but good)
        /*
        const order = await prisma.order.findFirst({
            where: {
                customerId,
                items: { some: { medicineId } },
                status: "DELIVERED"
            }
        });
        if (!order) return res.status(403).json(error("You can only review medicines you have purchased and received."));
        */

        const review = await prisma.review.upsert({
            where: {
                medicineId_customerId: {
                    medicineId,
                    customerId
                }
            },
            update: {
                rating,
                comment,
                updatedAt: new Date()
            },
            create: {
                medicineId,
                customerId,
                rating,
                comment
            },
            include: { customer: { select: { name: true } } }
        });

        res.status(201).json(success(review, "Review submitted"));
    } catch (e) {
        console.error("Review creation failed:", e);
        res.status(500).json(error("Failed to submit review"));
    }
};

export const getMedicineReviews = async (req: AuthRequest, res: Response) => {
    try {
        const { medicineId } = req.params;
        const reviews = await prisma.review.findMany({
            where: { medicineId: medicineId as string },
            include: { customer: { select: { name: true, image: true } } },
            orderBy: { createdAt: "desc" }
        });
        res.json(success(reviews));
    } catch (e) {
        res.status(500).json(error("Failed to fetch reviews"));
    }
};
