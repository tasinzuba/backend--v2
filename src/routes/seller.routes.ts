import { Router } from "express";
import {
    addMedicine,
    getSellerMedicines,
    updateMedicine,
    deleteMedicine,
    getSellerOrders,
    updateOrderStatus
} from "../controllers/seller.controller";
import { authMiddleware, roleMiddleware } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";
import { medicineSchema } from "../validators/schemas";

const router = Router();

router.use(authMiddleware, roleMiddleware(["SELLER"]));

router.post("/medicines", validate(medicineSchema), addMedicine);
router.get("/medicines", getSellerMedicines);
router.put("/medicines/:id", updateMedicine); // Partial updates might need a different schema or allow partial
router.delete("/medicines/:id", deleteMedicine);

router.get("/orders", getSellerOrders);
router.patch("/orders/:id", updateOrderStatus);

export default router;
