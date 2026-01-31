import { Router } from "express";
import { createOrder, getMyOrders, getOrderById } from "../controllers/order.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validation.middleware.js";
import { orderSchema } from "../validators/schemas.js";

const router = Router();

router.use(authMiddleware);

router.post("/", validate(orderSchema), createOrder);
router.get("/", getMyOrders);
router.get("/:id", getOrderById);

export default router;
