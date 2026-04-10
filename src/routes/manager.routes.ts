import { Router } from "express";
import {
    getManagerStats,
    getManagerOrders,
    updateOrderStatus,
    getManagerMedicines,
} from "../controllers/manager.controller.js";
import { authMiddleware, roleMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authMiddleware, roleMiddleware(["MANAGER", "ADMIN"]));

router.get("/stats", getManagerStats);
router.get("/orders", getManagerOrders);
router.patch("/orders/:id", updateOrderStatus);
router.get("/medicines", getManagerMedicines);

export default router;
