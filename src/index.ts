import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import medicineRoutes from "./routes/medicine.routes";
import orderRoutes from "./routes/order.routes";
import sellerRoutes from "./routes/seller.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());

app.all("/api/auth/*", toNodeHandler(auth));
app.use("/api/medicines", medicineRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/seller", sellerRoutes);

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

app.get("/", (req, res) => {
    res.json({ name: "MediStore API", version: "2.0.0" });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
