import { z } from "zod";

export const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(2),
    phone: z.string().optional(),
    role: z.enum(["CUSTOMER", "SELLER"]).default("CUSTOMER"),
});

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

export const medicineSchema = z.object({
    name: z.string().min(2),
    description: z.string().optional(),
    price: z.number().positive(),
    stock: z.number().int().min(0).default(0),
    image: z.string().optional(),
    categoryId: z.string(),
});

export const orderSchema = z.object({
    items: z.array(z.object({
        medicineId: z.string(),
        quantity: z.number().int().positive(),
    })).min(1),
    shippingAddress: z.string().min(10),
});

export const categorySchema = z.object({
    name: z.string().min(2),
    description: z.string().optional(),
    image: z.string().optional(),
});

export const reviewSchema = z.object({
    rating: z.number().int().min(1).max(5),
    comment: z.string().optional(),
});
