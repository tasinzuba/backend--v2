import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import medicineRoutes from "./routes/medicine.routes";
import orderRoutes from "./routes/order.routes";
import sellerRoutes from "./routes/seller.routes";
import adminRoutes from "./routes/admin.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security Middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));

// Performance Middleware
app.use(compression());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
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

app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/", (req, res) => {
    res.json({ name: "MediStore API", version: "2.0.0", env: process.env.NODE_ENV });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
