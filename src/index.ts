import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import { logger } from "./lib/logger.js";
import { prisma } from "./lib/prisma.js";
import medicineRoutes from "./routes/medicine.routes.js";
import orderRoutes from "./routes/order.routes.js";
import sellerRoutes from "./routes/seller.routes.js";
import adminRoutes from "./routes/admin.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security Middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));

// Performance Middleware
app.use(compression());

// Request logging middleware
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
});

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, error: "Too many requests, please try again later." }
});
app.use("/api", limiter);

// Body Parsing
app.use(express.json());

// Routes
app.all("/api/auth/*", toNodeHandler(auth));
app.use("/api/medicines", medicineRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/admin", adminRoutes);

app.get("/health", async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({
            status: "ok",
            timestamp: new Date().toISOString(),
            database: "connected"
        });
    } catch (e) {
        logger.error("Health check failed", e);
        res.status(503).json({
            status: "error",
            timestamp: new Date().toISOString(),
            database: "disconnected"
        });
    }
});

app.get("/", (req, res) => {
    res.json({ name: "MediStore Backend -Working...." });
});

if (process.env.NODE_ENV !== "production") {
    app.listen(PORT, () => {
        logger.info(`Server running on http://localhost:${PORT}`);
    });
}

export default app;
