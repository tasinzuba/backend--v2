import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import compression from "compression";
import uploadRoutes from "./routes/upload.routes.js";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import { logger } from "./lib/logger.js";
import { prisma } from "./lib/prisma.js";
import medicineRoutes from "./routes/medicine.routes.js";
import orderRoutes from "./routes/order.routes.js";
import sellerRoutes from "./routes/seller.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import reviewRoutes from "./routes/review.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.set("trust proxy", 1);

app.use(cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie", "x-requested-with", "accept", "origin"],
    exposedHeaders: ["Set-Cookie"],
    maxAge: 86400
}));

app.options("*", (req, res) => {
    res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie, x-requested-with, accept, origin");
    res.sendStatus(200);
});

app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.all("/api/auth/*", (req, res) => {
    return toNodeHandler(auth)(req, res);
});


app.use("/api/medicines", medicineRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/uploads", express.static("uploads"));

app.get("/health", async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.status(200).json({ status: "ok" });
    } catch (e) {
        res.status(503).json({ status: "error" });
    }
});

app.get("/", (req, res) => {
    res.json({ message: "MediStore App Backend is running" });
});

if (process.env.NODE_ENV !== "production") {
    app.listen(PORT, () => {
        logger.info(`Server running on http://localhost:${PORT}`);
    });
}

export default app;
