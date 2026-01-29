import { Router } from "express";
import { createOrder, getMyOrders, getOrderById } from "../controllers/order.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";
import { orderSchema } from "../validators/schemas";

const router = Router();

router.use(authMiddleware);

router.post("/", validate(orderSchema), createOrder);
router.get("/", getMyOrders);
router.get("/:id", getOrderById);

export default router;
